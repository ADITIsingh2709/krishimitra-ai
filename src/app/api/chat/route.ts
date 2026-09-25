import { NextRequest, NextResponse } from 'next/server';
import { generateChatResponse } from '@/lib/chatbot';
import { checkRateLimit, verifySessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('krishi_token')?.value;
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    let farmerId = 'user_farmer_01';
    let farmerName = 'Farmer';
    let farmerLocation = 'Ludhiana';

    if (token) {
      const user = await verifySessionToken(token);
      if (user) {
        farmerId = user.id;
        farmerName = user.name;
        if (user.location?.district) farmerLocation = user.location.district;
      }
    }

    // Rate limit: max 30 chat messages per minute
    const allowed = checkRateLimit(`chat_${farmerId}`, 30, 60000);
    if (!allowed) {
      return NextResponse.json({ error: 'Chat rate limit reached. Please wait a moment.' }, { status: 429 });
    }

    const body = await req.json();
    const { messages, language = 'hi' } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const response = await generateChatResponse({
      messages,
      language,
      farmerId,
      farmerName,
      farmerLocation,
    });

    return NextResponse.json({
      success: true,
      response,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Chat generation failed' }, { status: 500 });
  }
}
