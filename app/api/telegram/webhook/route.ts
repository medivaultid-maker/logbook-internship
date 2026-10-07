import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const update = await request.json();

    console.log("Telegram update:", update);

    const message = update.message;

    if (!message?.chat?.id) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text || "";

    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      console.error("TELEGRAM_BOT_TOKEN belum diatur");
      return NextResponse.json(
        {
          ok: false,
          error: "Telegram token belum tersedia",
        },
        { status: 500 }
      );
    }

    let reply = "";

    if (text.toLowerCase() === "/start") {
      reply =
        "Halo! 👋\n\nSelamat datang di Bot Logbook Internsip.\n\nKirim pesan apa saja untuk mencoba bot ini.";
    } else {
      reply = `Halo! 👋\n\nPesan kamu sudah diterima:\n"${text}"`;
    }

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: reply,
        }),
      }
    );

    const telegramResult = await telegramResponse.json();

    console.log("Telegram sendMessage result:", telegramResult);

    return NextResponse.json({
      ok: true,
      telegram: telegramResult,
    });
  } catch (error) {
    console.error("Telegram webhook error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Invalid request",
      },
      {
        status: 400,
      }
    );
  }
}