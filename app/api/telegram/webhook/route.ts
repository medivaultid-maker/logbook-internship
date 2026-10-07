import { NextResponse } from "next/server";

type Session = {
  step: string;
  data: Record<string, string>;
};

const sessions = new Map<number, Session>();

const TELEGRAM_API = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN belum diatur");
  }

  return `https://api.telegram.org/bot${token}`;
};

async function telegram(method: string, body: any) {
  const response = await fetch(`${TELEGRAM_API()}/${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return response.json();
}

export async function POST(request: Request) {
  try {
    const update = await request.json();

    console.log("Telegram update:", update);

    // =====================================================
    // 1. CALLBACK QUERY
    // =====================================================

    if (update.callback_query) {
      const callback = update.callback_query;

      const callbackId = callback.id;
      const data = callback.data;
      const chatId = callback.message?.chat?.id;
      const messageId = callback.message?.message_id;

      await telegram("answerCallbackQuery", {
        callback_query_id: callbackId,
      });

      if (!chatId || !messageId) {
        return NextResponse.json({ ok: true });
      }

      // ===================================================
      // MENU UTAMA
      // ===================================================

      if (data === "menu_start") {
        sessions.delete(chatId);

        await telegram("editMessageText", {
          chat_id: chatId,
          message_id: messageId,
          text:
            "🩺 *Logbook Internsip Kemenkes*\n\n" +
            "Silakan pilih jenis kegiatan yang ingin kamu input:",
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                { text: "🩺 UKP", callback_data: "menu_ukp" },
                { text: "🌱 UKM", callback_data: "menu_ukm" },
              ],
              [
                {
                  text: "💉 Tindakan Medis",
                  callback_data: "menu_tindakan",
                },
              ],
              [
                {
                  text: "📋 Mini Project",
                  callback_data: "menu_miniproject",
                },
              ],
            ],
          },
        });

        return NextResponse.json({ ok: true });
      }

      // ===================================================
      // UKP
      // ===================================================

      if (data === "menu_ukp") {
        await telegram("editMessageText", {
          chat_id: chatId,
          message_id: messageId,
          text:
            "🩺 *UKP*\n\n" +
            "Pilih tindakan yang ingin dilakukan:",
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "➕ Input UKP",
                  callback_data: "ukp_input",
                },
              ],
              [
                {
                  text: "⬅️ Kembali",
                  callback_data: "menu_start",
                },
              ],
            ],
          },
        });

        return NextResponse.json({ ok: true });
      }

      // ===================================================
      // INPUT UKP
      // ===================================================

      if (data === "ukp_input") {
        sessions.set(chatId, {
          step: "ukp_tanggal",
          data: {},
        });

        await telegram("editMessageText", {
          chat_id: chatId,
          message_id: messageId,
          text:
            "🩺 *Input UKP*\n\n" +
            "Kita akan mengisi data UKP secara bertahap.\n\n" +
            "📅 *Tanggal kegiatan?*\n\n" +
            "Contoh:\n" +
            "`07/10/2026`",
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "❌ Batalkan",
                  callback_data: "menu_start",
                },
              ],
            ],
          },
        });

        return NextResponse.json({ ok: true });
      }

      // ===================================================
      // UKM
      // ===================================================

      if (data === "menu_ukm") {
        await telegram("editMessageText", {
          chat_id: chatId,
          message_id: messageId,
          text:
            "🌱 *UKM*\n\n" +
            "Pilih jenis kegiatan UKM:",
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🏠 Kesling",
                  callback_data: "ukm_kesling",
                },
              ],
              [
                {
                  text: "📢 Promkes",
                  callback_data: "ukm_promkes",
                },
              ],
              [
                {
                  text: "👨‍👩‍👧 Kesehatan Keluarga",
                  callback_data: "ukm_keluarga",
                },
              ],
              [
                {
                  text: "🍎 Pelayanan Gizi",
                  callback_data: "ukm_gizi",
                },
              ],
              [
                {
                  text: "🦠 P2P",
                  callback_data: "ukm_p2p",
                },
              ],
              [
                {
                  text: "⬅️ Kembali",
                  callback_data: "menu_start",
                },
              ],
            ],
          },
        });

        return NextResponse.json({ ok: true });
      }

      // ===================================================
      // UKM CATEGORY
      // ===================================================

      const ukmCategories: Record<string, string> = {
        ukm_kesling: "🏠 *Kesehatan Lingkungan (Kesling)*",
        ukm_promkes: "📢 *Promosi Kesehatan (Promkes)*",
        ukm_keluarga: "👨‍👩‍👧 *Kesehatan Keluarga*",
        ukm_gizi: "🍎 *Pelayanan Gizi*",
        ukm_p2p:
          "🦠 *Pencegahan dan Pengendalian Penyakit (P2P)*",
      };

      if (ukmCategories[data]) {
        await telegram("editMessageText", {
          chat_id: chatId,
          message_id: messageId,
          text:
            `${ukmCategories[data]}\n\n` +
            "Kita akan mengisi data kegiatan secara bertahap.\n\n" +
            "📅 *Pertanyaan pertama:*\n\n" +
            "Tanggal kegiatan kapan?\n\n" +
            "Contoh:\n" +
            "`07/10/2026`",
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "❌ Batalkan",
                  callback_data: "menu_start",
                },
              ],
            ],
          },
        });

        return NextResponse.json({ ok: true });
      }

      // ===================================================
      // TINDAKAN MEDIS
      // ===================================================

      if (data === "menu_tindakan") {
        await telegram("editMessageText", {
          chat_id: chatId,
          message_id: messageId,
          text:
            "💉 *Tindakan Medis*\n\n" +
            "Fitur input tindakan medis akan kita buat setelah alur UKP dan UKM selesai.",
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "⬅️ Kembali",
                  callback_data: "menu_start",
                },
              ],
            ],
          },
        });

        return NextResponse.json({ ok: true });
      }

      // ===================================================
      // MINI PROJECT
      // ===================================================

      if (data === "menu_miniproject") {
        await telegram("editMessageText", {
          chat_id: chatId,
          message_id: messageId,
          text:
            "📋 *Mini Project*\n\n" +
            "Fitur Mini Project akan kita buat setelah alur utama selesai.",
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "⬅️ Kembali",
                  callback_data: "menu_start",
                },
              ],
            ],
          },
        });

        return NextResponse.json({ ok: true });
      }

      return NextResponse.json({ ok: true });
    }

    // =====================================================
    // 2. PESAN BIASA
    // =====================================================

    const message = update.message;

    if (!message?.chat?.id) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text?.trim() || "";

    const session = sessions.get(chatId);

    // =====================================================
    // STATE / SESSION
    // =====================================================

    if (session) {
      // =========================
      // TANGGAL
      // =========================

      if (session.step === "ukp_tanggal") {
        session.data.tanggal = text;
        session.step = "ukp_pasien";

        await telegram("sendMessage", {
          chat_id: chatId,
          text:
            "✅ Tanggal dicatat.\n\n" +
            "👤 *Data pasien*\n\n" +
            "Silakan masukkan identitas singkat pasien.\n\n" +
            "Contoh:\n" +
            "`Perempuan, 45 tahun`",
          parse_mode: "Markdown",
        });

        return NextResponse.json({ ok: true });
      }

      // =========================
      // DATA PASIEN
      // =========================

      if (session.step === "ukp_pasien") {
        session.data.pasien = text;
        session.step = "ukp_diagnosis";

        await telegram("sendMessage", {
          chat_id: chatId,
          text:
            "✅ Data pasien dicatat.\n\n" +
            "🩺 *Diagnosis utama?*\n\n" +
            "Masukkan diagnosis pasien.",
          parse_mode: "Markdown",
        });

        return NextResponse.json({ ok: true });
      }

      // =========================
      // DIAGNOSIS
      // =========================

      if (session.step === "ukp_diagnosis") {
        session.data.diagnosis = text;
        session.step = "ukp_diagnosis_banding";

        await telegram("sendMessage", {
          chat_id: chatId,
          text:
            "✅ Diagnosis dicatat.\n\n" +
            "🔍 *Diagnosis banding?*\n\n" +
            "Masukkan diagnosis banding.\n\n" +
            "Jika tidak ada, ketik:\n" +
            "`Tidak ada`",
          parse_mode: "Markdown",
        });

        return NextResponse.json({ ok: true });
      }

      // =========================
      // DIAGNOSIS BANDING
      // =========================

      if (session.step === "ukp_diagnosis_banding") {
        session.data.diagnosis_banding = text;
        session.step = "ukp_anamnesis";

        await telegram("sendMessage", {
          chat_id: chatId,
          text:
            "🎉 *4 data pertama berhasil dikumpulkan!*\n\n" +
            `📅 Tanggal: ${session.data.tanggal}\n` +
            `👤 Pasien: ${session.data.pasien}\n` +
            `🩺 Diagnosis: ${session.data.diagnosis}\n` +
            `🔍 Diagnosis banding: ${session.data.diagnosis_banding}\n\n` +
            "📝 *Sekarang masukkan anamnesis.*",
          parse_mode: "Markdown",
        });

        return NextResponse.json({ ok: true });
      }

      // =========================
      // ANAMNESIS
      // =========================

      if (session.step === "ukp_anamnesis") {
        session.data.anamnesis = text;
        session.step = "ukp_pemeriksaan";

        await telegram("sendMessage", {
          chat_id: chatId,
          text:
            "📝 *Anamnesis dicatat.*\n\n" +
            "🔬 Sekarang masukkan hasil pemeriksaan fisik.",
          parse_mode: "Markdown",
        });

        return NextResponse.json({ ok: true });
      }

      // =========================
      // PEMERIKSAAN
      // =========================

      if (session.step === "ukp_pemeriksaan") {
        session.data.pemeriksaan = text;
        session.step = "ukp_penunjang";

        await telegram("sendMessage", {
          chat_id: chatId,
          text:
            "🔬 *Pemeriksaan fisik dicatat.*\n\n" +
            "🧪 Sekarang masukkan hasil pemeriksaan penunjang.\n\n" +
            "Jika tidak ada, ketik:\n" +
            "`Tidak ada`",
          parse_mode: "Markdown",
        });

        return NextResponse.json({ ok: true });
      }

      // =========================
      // PENUNJANG
      // =========================

      if (session.step === "ukp_penunjang") {
        session.data.penunjang = text;
        session.step = "ukp_tatalaksana";

        await telegram("sendMessage", {
          chat_id: chatId,
          text:
            "🧪 *Pemeriksaan penunjang dicatat.*\n\n" +
            "💊 Sekarang masukkan tatalaksana yang diberikan.",
          parse_mode: "Markdown",
        });

        return NextResponse.json({ ok: true });
      }

      // =========================
      // TATALAKSANA
      // =========================

      if (session.step === "ukp_tatalaksana") {
        session.data.tatalaksana = text;

        console.log("DATA UKP LENGKAP:", session.data);

        await telegram("sendMessage", {
          chat_id: chatId,
          text:
            "🎉 *Data UKP lengkap!*\n\n" +
            `📅 ${session.data.tanggal}\n` +
            `👤 ${session.data.pasien}\n` +
            `🩺 ${session.data.diagnosis}\n` +
            `🔍 ${session.data.diagnosis_banding}\n` +
            `📝 ${session.data.anamnesis}\n` +
            `🔬 ${session.data.pemeriksaan}\n` +
            `🧪 ${session.data.penunjang}\n` +
            `💊 ${session.data.tatalaksana}\n\n` +
            "Tahap berikutnya: kita akan membuat tombol *Simpan ke Logbook*.",
          parse_mode: "Markdown",
        });

        session.step = "ukp_konfirmasi";

        return NextResponse.json({ ok: true });
      }

      // Kalau ada session tapi step tidak dikenali
      sessions.delete(chatId);

      await telegram("sendMessage", {
        chat_id: chatId,
        text:
          "Sesi input tidak dikenali. 😅\n\n" +
          "Silakan mulai kembali dari menu utama.",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🏠 Menu Utama",
                callback_data: "menu_start",
              },
            ],
          ],
        },
      });

      return NextResponse.json({ ok: true });
    }

    // =====================================================
    // /START
    // =====================================================

    if (text === "/start") {
      await telegram("sendMessage", {
        chat_id: chatId,
        text:
          "🩺 *Logbook Internsip Kemenkes*\n\n" +
          "Selamat datang! 👋\n\n" +
          "Silakan pilih jenis kegiatan yang ingin kamu input:",
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "🩺 UKP", callback_data: "menu_ukp" },
              { text: "🌱 UKM", callback_data: "menu_ukm" },
            ],
            [
              {
                text: "💉 Tindakan Medis",
                callback_data: "menu_tindakan",
              },
            ],
            [
              {
                text: "📋 Mini Project",
                callback_data: "menu_miniproject",
              },
            ],
          ],
        },
      });

      return NextResponse.json({ ok: true });
    }

    // =====================================================
    // PESAN LAIN
    // =====================================================

    await telegram("sendMessage", {
      chat_id: chatId,
      text:
        "Aku belum memahami pesan tersebut 😅\n\n" +
        "Ketik /start untuk membuka menu Logbook Internsip.",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🏠 Menu Utama",
              callback_data: "menu_start",
            },
          ],
        ],
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}