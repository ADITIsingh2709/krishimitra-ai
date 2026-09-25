import { NextRequest, NextResponse } from 'next/server';
import { getRegionalAlerts, saveRegionalAlert, addAdminLog } from '@/lib/db';
import { verifySessionToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const alerts = await getRegionalAlerts();
    return NextResponse.json({ success: true, alerts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Alerts lookup failed' }, { status: 500 });
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
    const { title, crop, state, district, severity, message, actionRequired } = body;

    const newAlert = {
      id: 'alert_' + Date.now(),
      title,
      crop,
      state,
      district,
      severity,
      message,
      actionRequired,
      broadcastDate: new Date().toISOString(),
      adminName: user.name,
    };

    const saved = await saveRegionalAlert(newAlert);

    await addAdminLog({
      id: 'log_' + Date.now(),
      adminId: user.id,
      adminName: user.name,
      action: 'ALERT_PUBLISHED',
      details: `Published ${severity} alert: "${title}" for ${district}, ${state} on crop ${crop}.`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, alert: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to publish alert' }, { status: 500 });
  }
}
