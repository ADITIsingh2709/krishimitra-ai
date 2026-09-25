import { NextRequest, NextResponse } from 'next/server';
import { parseSoilHealthCardOcr } from '@/lib/ml';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = parseSoilHealthCardOcr(body.imageSample);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'OCR parsing failed' }, { status: 500 });
  }
}
