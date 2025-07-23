import { NextResponse } from 'next/server';
import { ASKYOURDATABASE_CONFIG } from '@/lib/ayd-config';

export async function POST() {
  try {
    const response = await fetch(`${ASKYOURDATABASE_CONFIG.HOST}/api/chatbot/newChat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ASKYOURDATABASE_CONFIG.API_KEY}`,
      },
      body: JSON.stringify({
        botid: ASKYOURDATABASE_CONFIG.BOTID,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Failed to create new chat: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating new chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}