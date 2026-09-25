import { NextRequest, NextResponse } from 'next/server';
import { getUsers, getScans, getYieldPredictions } from '@/lib/db';
import { verifySessionToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
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
    const query = searchParams.get('q')?.toLowerCase() || '';

    const allUsers = await getUsers();
    let farmers = allUsers.filter(u => u.role === 'farmer');

    if (query) {
      farmers = farmers.filter(f => 
        f.name.toLowerCase().includes(query) ||
        f.phone.includes(query) ||
        f.location?.district.toLowerCase().includes(query) ||
        f.location?.state.toLowerCase().includes(query) ||
        f.primaryCrops.some(c => c.toLowerCase().includes(query))
      );
    }

    // Attach scan and yield summary counts per farmer
    const allScans = await getScans();
    const allYields = await getYieldPredictions();

    const farmersWithActivity = farmers.map(f => {
      const scansCount = allScans.filter(s => s.farmerId === f.id).length;
      const yieldsCount = allYields.filter(y => y.farmerId === f.id).length;
      return {
        ...f,
        scansCount,
        yieldsCount,
      };
    });

    return NextResponse.json({ success: true, farmers: farmersWithActivity });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Farmers lookup failed' }, { status: 500 });
  }
}
