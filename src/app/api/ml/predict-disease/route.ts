import { NextRequest, NextResponse } from 'next/server';
import { predictCropDisease } from '@/lib/ml';
import { saveScan } from '@/lib/db';
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
    const { crop, imageUrl, presetKey } = body;

    const diagnosis = await predictCropDisease({
      crop,
      imageUrl,
      presetKey,
      farmerId,
    });

    // Persist diagnosis scan in database
    await saveScan(diagnosis);

    return NextResponse.json({
      success: true,
      diagnosis,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Disease prediction failed' }, { status: 500 });
  }
}
