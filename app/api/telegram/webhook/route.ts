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
    const text = message.text?.trim() || "";

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
    let replyMarkup = undefined;

    // =========================
    // MENU START
    // =========================

    if (text === "/start") {
      reply =
        "🩺 *Logbook Internsip Kemenkes*\n\n" +
        "Selamat datang! 👋\n\n" +
        "Silakan pilih jenis kegiatan yang ingin kamu input:";

      replyMarkup = {
        inline_keyboard: [
          [
            { text: "🩺 UKP", callback_data: "menu_ukp" },
            { text: "🌱 UKM", callback_data: "menu_ukm" },
          ],
          [
            { text: "💉 Tindakan Medis", callback_data: "menu_tindakan" },
          ],
          [
            { text: "📋 Mini Project", callback_data: "menu_miniproject" },
          ],
        ],
      };
    }

    // =========================
    // FALLBACK
    // =========================

    else {
      reply =
        "Aku belum memahami perintah tersebut 😅\n\n" +
        "Ketik /start untuk membuka menu Logbook Internsip.";

      replyMarkup = {
        inline_keyboard: [
          [{ text: "🏠 Menu Utama", callback_data: "menu_start" }],
        ],
      };
    }

    // =========================
    // KIRIM PESAN
    // =========================

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
          parse_mode: "Markdown",
          reply_markup: replyMarkup,
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