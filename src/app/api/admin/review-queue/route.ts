import { NextRequest, NextResponse } from 'next/server';
import { getScans, updateScan, addAdminLog } from '@/lib/db';
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

    const allScans = await getScans();
    // Prioritize under_review scans, followed by recently diagnosed
    return NextResponse.json({
      success: true,
      scans: allScans,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Review queue fetch failed' }, { status: 500 });
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
    const { scanId, action, correctedDisease, adminNotes } = body;

    if (!scanId || !action) {
      return NextResponse.json({ error: 'Scan ID and action required' }, { status: 400 });
    }

    const isCorrection = action === 'CORRECT';
    const status = isCorrection ? 'corrected_by_admin' : 'verified_by_admin';

    const updated = await updateScan(scanId, {
      status,
      adminNotes,
      correctedDisease: isCorrection ? correctedDisease : undefined,
    });

    // Log the human-in-the-loop action for model retraining
    await addAdminLog({
      id: 'log_' + Date.now(),
      adminId: user.id,
      adminName: user.name,
      action: isCorrection ? 'DIAGNOSIS_CORRECTED' : 'DIAGNOSIS_VERIFIED',
      details: isCorrection
        ? `Corrected scan ${scanId} diagnosis to '${correctedDisease}'. Notes: ${adminNotes}`
        : `Verified scan ${scanId} diagnosis. Notes: ${adminNotes || 'Confirmed by agronomist'}`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, scan: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Review action failed' }, { status: 500 });
  }
}
