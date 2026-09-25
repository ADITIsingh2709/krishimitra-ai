import { NextRequest, NextResponse } from 'next/server';
import { verifyOtpAndGetUser, createSessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, code, roleOverride } = body;

    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone and OTP code are required' }, { status: 400 });
    }

    const { success, user, isNewUser, error } = await verifyOtpAndGetUser(phone, code);

    if (!success || !user) {
      return NextResponse.json({ error: error || 'Verification failed' }, { status: 400 });
    }

    // Role override for quick testing if requested (e.g. testing admin console)
    if (roleOverride === 'admin') {
      user.role = 'admin';
    }

    const token = createSessionToken(user);

    const response = NextResponse.json({
      success: true,
      token,
      user,
      isNewUser,
    });

    // Set secure HTTP-only cookie
    response.cookies.set('krishi_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'OTP verification failed' }, { status: 500 });
  }
}
