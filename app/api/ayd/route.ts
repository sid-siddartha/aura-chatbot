import { NextRequest, NextResponse } from "next/server";
import { ASKYOURDATABASE_CONFIG } from "@/lib/ayd-config";

export const revalidate = 0;

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {

  const body = {
    "chatbotid": process.env.AYD_CHATBOT_ID,
    "name": "none",
    "email": "none@none.com",
    "oId": "6371"
  }

  const { url } = await fetch(`${ASKYOURDATABASE_CONFIG.HOST}/api/chatbot/v2/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.AYD_API_KEY}`
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());

  return NextResponse.json({ url });
}