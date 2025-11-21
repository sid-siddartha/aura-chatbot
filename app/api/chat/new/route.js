import { NextResponse } from "next/server";
import { ASKYOURDATABASE_CONFIG } from "@/lib/ayd-config";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const body = {
      chatbotid: process.env.AYD_CHATBOT_ID,
      name: "none",
      email: "none@none.com",
      oId: "6371",
    };

    const response = await fetch(
      `${ASKYOURDATABASE_CONFIG.HOST}/api/chatbot/v2/session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.AYD_API_KEY}`,
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
