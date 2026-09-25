import { NextRequest, NextResponse } from 'next/server';
import { getAdminLogs } from '@/lib/db';
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

    const logs = await getAdminLogs();
    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch logs' }, { status: 500 });
  }
}
