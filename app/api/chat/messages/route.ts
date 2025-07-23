import { NextRequest, NextResponse } from 'next/server';
import { ASKYOURDATABASE_CONFIG } from '@/lib/ayd-config';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const chatid = searchParams.get('chatid');
    const debug = searchParams.get('debug') || 'true';
    const timestamp = searchParams.get('timestamp');

    if (!chatid) {
      return NextResponse.json(
        { error: 'chatid is required' },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      botid: ASKYOURDATABASE_CONFIG.BOTID,
      chatid,
      debug,
    });

    if (timestamp) {
      params.append('timestamp', timestamp);
    }

    const response = await fetch(
      `${ASKYOURDATABASE_CONFIG.HOST}/api/chatbot/messages?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${ASKYOURDATABASE_CONFIG.API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Failed to get chat messages: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting chat messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}