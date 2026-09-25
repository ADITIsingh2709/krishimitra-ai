import { NextRequest, NextResponse } from 'next/server';
import { findNearbyKvkCenters } from '@/lib/kvk';
import { saveKvkCenter, deleteKvkCenter, addAdminLog } from '@/lib/db';
import { verifySessionToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;
    const state = searchParams.get('state') || undefined;
    const district = searchParams.get('district') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 5;

    const centers = await findNearbyKvkCenters({ lat, lng, state, district, limit });
    return NextResponse.json({ success: true, centers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'KVK lookup failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('krishi_token')?.value;
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await verifySessionToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 });
    }

    const body = await req.json();
    const newCenter = {
      ...body,
      id: body.id || 'kvk_' + Date.now(),
    };

    const saved = await saveKvkCenter(newCenter);
    await addAdminLog({
      id: 'log_' + Date.now(),
      adminId: user.id,
      adminName: user.name,
      action: 'KVK_ADDED',
      details: `Added new center: ${saved.name} in ${saved.district}, ${saved.state}`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, center: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save KVK center' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('krishi_token')?.value;
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await verifySessionToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Center ID required' }, { status: 400 });

    await deleteKvkCenter(id);
    await addAdminLog({
      id: 'log_' + Date.now(),
      adminId: user.id,
      adminName: user.name,
      action: 'KVK_DELETED',
      details: `Deleted center ID: ${id}`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete center' }, { status: 500 });
  }
}
