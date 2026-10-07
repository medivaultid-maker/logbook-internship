import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    return NextResponse.json({
      ok: false,
      message: "TELEGRAM_BOT_TOKEN belum terbaca",
    });
  }

  return NextResponse.json({
    ok: true,
    message: "Telegram token berhasil terbaca",
  });
}