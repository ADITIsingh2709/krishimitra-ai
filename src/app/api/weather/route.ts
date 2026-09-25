import { NextRequest, NextResponse } from 'next/server';
import { getWeatherData } from '@/lib/weather';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const district = searchParams.get('district') || 'Ludhiana';
    const state = searchParams.get('state') || 'Punjab';

    const weather = await getWeatherData(district, state);
    return NextResponse.json({ success: true, weather });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Weather lookup failed' }, { status: 500 });
  }
}
