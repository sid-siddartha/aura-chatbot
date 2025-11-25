import { NextResponse } from "next/server";
import { ASKYOURDATABASE_CONFIG } from "@/lib/ayd-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const body = {
      chatbotid: process.env.AYD_CHATBOT_ID,
      name: "anonymous",
      email: "anonymous@local",
      oId: "local",
    };

    const response = await fetch(
      `${ASKYOURDATABASE_CONFIG.HOST}/api/chatbot/v2/session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ASKYOURDATABASE_CONFIG.API_KEY}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.url) {
      return NextResponse.json(
        { error: "Failed to create chatbot session", details: data },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: data.url });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
