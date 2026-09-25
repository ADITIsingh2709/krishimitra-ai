import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, generateAndStoreOtp } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, name } = body;

    if (!phone || phone.replace(/[^0-9]/g, '').length < 10) {
      return NextResponse.json({ error: 'Valid 10-digit mobile number required' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);

    // Rate limit: max 5 OTP requests per minute per phone
    const allowed = checkRateLimit(`otp_${cleanPhone}`, 5, 60000);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many OTP requests. Please wait a minute.' }, { status: 429 });
    }

    const { code, expiresAt } = generateAndStoreOtp(cleanPhone, name || 'Kisan');

    // In a production setup with Twilio or MSG91:
    // await twilioClient.verify.v2.services(SID).verifications.create({ to: `+91${cleanPhone}`, channel: 'sms' })
    console.log(`[SMS-GATEWAY] Sending OTP to +91${cleanPhone}: ${code}`);

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to +91 ${cleanPhone}`,
      expiresAt,
      // Provide demoCode for frictionless testing in development/demo environments
      demoCode: code,
      notice: 'Demo master OTP is 123456 or use the generated demoCode',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to send OTP' }, { status: 500 });
  }
}
