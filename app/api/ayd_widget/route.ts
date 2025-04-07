import { NextRequest, NextResponse } from "next/server";

export const revalidate = 0;

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {

  const body = await fetch("https://www.askyourdatabase.com/api/widget/v2/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.AYD_API_KEY}`
    },
    body: JSON.stringify({
      "widgetId": process.env.AYD_WIDGET_ID,
      "name": "Sheldon",
      "email": "test@gmail.com"
    }),
  }).then((res) => res.json());

  console.log(body)

  return NextResponse.json(body);
}