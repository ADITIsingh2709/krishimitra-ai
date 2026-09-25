import { NextRequest, NextResponse } from 'next/server';
import { predictCropYield } from '@/lib/ml';
import { saveYieldPrediction } from '@/lib/db';
import { verifySessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('krishi_token')?.value;
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    let farmerId = 'user_farmer_01';
    if (token) {
      const user = await verifySessionToken(token);
      if (user) farmerId = user.id;
    }

    const body = await req.json();
    const result = await predictCropYield({
      ...body,
      farmerId,
    });

    await saveYieldPrediction(result);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Yield prediction failed' }, { status: 500 });
  }
}
