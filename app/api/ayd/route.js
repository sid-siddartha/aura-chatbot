import { NextResponse } from "next/server";
import { ASKYOURDATABASE_CONFIG } from "@/lib/ayd-config";

export const revalidate = 0;
export const dynamic = "force-dynamic";
export const runtime = "edge"; // 🚀 SUPER FAST

export async function POST(req) {
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
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json({ url: data.url });
  } catch (error) {
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}
