import { NextRequest } from 'next/server';
import { ASKYOURDATABASE_CONFIG } from '@/lib/ayd-config';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, chatid, debug = true } = body;

    if (!question || !chatid) {
      return new Response(
        JSON.stringify({ error: 'question and chatid are required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const response = await fetch(`${ASKYOURDATABASE_CONFIG.HOST}/api/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ASKYOURDATABASE_CONFIG.API_KEY}`,
      },
      body: JSON.stringify({
        question,
        botid: ASKYOURDATABASE_CONFIG.BOTID,
        chatid,
        debug,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(
        JSON.stringify({ error: `Failed to send message: ${error}` }),
        { 
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 直接转发流式响应
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}