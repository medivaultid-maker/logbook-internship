import { NextResponse } from "next/server";

/* =====================================================
   TYPE
===================================================== */

type Session = {
  step: string;
  data: Record<string, string>;
};

/* =====================================================
   SESSION SEMENTARA
===================================================== */

const sessions = new Map<number, Session>();

/* =====================================================
   ENV
===================================================== */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

/* =====================================================
   TELEGRAM API
===================================================== */

function telegramApiUrl(method: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN belum diatur");
  }

  return `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`;
}

async function telegram(method: string, body: any) {
  const response = await fetch(telegramApiUrl(method), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("Telegram API error:", result);
  }

  return result;
}

/* =====================================================
   HELPER
===================================================== */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* =====================================================
   SUPABASE INSERT UKP
===================================================== */

async function saveUKPToSupabase(
  data: Record<string, string>,
  chatId: number
) {
  if (!SUPABASE_URL) {
    throw new Error("SUPABASE_URL belum diatur");
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY belum diatur"
    );
  }


const profileResponse = await fetch(
  `${SUPABASE_URL}/rest/v1/profiles?telegram_chat_id=eq.${chatId}&select=id`,
  {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY!}`,
    },
    cache: "no-store",
  }
);

if (!profileResponse.ok) {
  throw new Error("Gagal mencari akun pemilik Telegram.");
}

const profiles = await profileResponse.json();

if (profiles.length !== 1) {
  throw new Error(
    "Telegram belum terhubung ke tepat satu akun website."
  );
}

const userId = profiles[0].id;

  // =====================================================
  // VALIDASI SEMUA FIELD WAJIB
  // Tidak boleh ada field kosong / null
  // =====================================================

  const requiredFields = [
    "tanggal_pelayanan",
    "no_rm",
    "inisial_pasien",
    "jenis_tindakan",
    "sumber_data",
    "jenis_kelamin",
    "kategori_pasien",
    "kategori_kasus",
    "tb",
    "bb",
    "anamnesis",
    "pemeriksaan_fisik",
    "pemeriksaan_penunjang",
    "diagnosis",
    "diagnosis_banding",
    "farmakoterapi",
    "non_farmakoterapi",
    "monitoring_evaluasi",
    "status_rujukan",
  ];

  const missingFields = requiredFields.filter(
    (field) =>
      !data[field] ||
      data[field].trim() === ""
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Field UKP belum lengkap: ${missingFields.join(", ")}`
    );
  }

  // =====================================================
  // KONVERSI TB & BB
  // =====================================================

  const tb = Number(
    data.tb.replace(",", ".")
  );

  const bb = Number(
    data.bb.replace(",", ".")
  );

  if (!Number.isFinite(tb) || tb <= 0) {
    throw new Error(
      "Tinggi badan (TB) tidak valid"
    );
  }

  if (!Number.isFinite(bb) || bb <= 0) {
    throw new Error(
      "Berat badan (BB) tidak valid"
    );
  }

  // =====================================================
  // PAYLOAD SESUAI NAMA KOLOM TABEL `ukp`
  // =====================================================

  const payload = {
    user_id: userId,

    tanggal_pelayanan:
      data.tanggal_pelayanan,

    no_rm:
      data.no_rm,

    inisial_pasien:
      data.inisial_pasien,

    jenis_tindakan:
      data.jenis_tindakan,

    sumber_data:
      data.sumber_data,

    jenis_kelamin:
      data.jenis_kelamin,

    kategori_pasien:
      data.kategori_pasien,

    kategori_kasus:
      data.kategori_kasus,

    tb:
      tb,

    bb:
      bb,

    anamnesis:
      data.anamnesis,

    pemeriksaan_fisik:
      data.pemeriksaan_fisik,

    pemeriksaan_penunjang:
      data.pemeriksaan_penunjang,

    diagnosis:
      data.diagnosis,

    diagnosis_banding:
      data.diagnosis_banding,

    farmakoterapi:
      data.farmakoterapi,

    non_farmakoterapi:
      data.non_farmakoterapi,

    monitoring_evaluasi:
      data.monitoring_evaluasi,

    status_rujukan:
      data.status_rujukan,
  };

  // =====================================================
  // LOG PAYLOAD
  // =====================================================

  console.log(
    "========================================"
  );

  console.log(
    "PAYLOAD UKP YANG AKAN DIKIRIM:"
  );

  console.log(
    JSON.stringify(
      payload,
      null,
      2
    )
  );

  console.log(
    "========================================"
  );

  // =====================================================
  // INSERT KE SUPABASE
  // =====================================================

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/ukp`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        apikey:
          SUPABASE_SERVICE_ROLE_KEY,

        Authorization:
          `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,

        Prefer:
          "return=representation",
      },

      body:
        JSON.stringify(payload),
    }
  );

  const resultText =
    await response.text();

  // =====================================================
  // LOG RESPONSE SUPABASE
  // =====================================================

  console.log(
    "SUPABASE STATUS:",
    response.status
  );

  console.log(
    "SUPABASE RESPONSE:",
    resultText
  );

  // =====================================================
  // JIKA ERROR
  // =====================================================

  if (!response.ok) {
    let result: any = null;

    try {
      result =
        JSON.parse(resultText);
    } catch {
      result = null;
    }

    const errorMessage =
      result?.message ||
      result?.hint ||
      result?.details ||
      result?.error ||
      resultText ||
      "Gagal menyimpan data UKP ke Supabase";

    throw new Error(
      `Supabase error: ${errorMessage}`
    );
  }

  // =====================================================
  // BERHASIL
  // =====================================================

  try {
    return JSON.parse(resultText);
  } catch {
    return resultText;
  }
}

/* =====================================================
   TANGGAL HARI INI
===================================================== */

function getTodayJakarta(): string {
  const formatter =
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

  return formatter.format(
    new Date()
  );
}

/* =====================================================
   FORMAT TANGGAL
===================================================== */

function formatDateIndonesia(
  date: string
): string {
  const parts = date.split("-");

  if (parts.length !== 3) {
    return date;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/* =====================================================
   MENU UTAMA
===================================================== */

async function sendMainMenu(
  chatId: number,
  messageId?: number
) {
  const body = {
    chat_id: chatId,

    text:
      "🩺 <b>Logbook Internsip Kemenkes</b>\n\n" +
      "Silakan pilih jenis kegiatan yang ingin kamu input:",

    parse_mode: "HTML",

    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🩺 UKP",
            callback_data: "menu_ukp",
          },
          {
            text: "🌱 UKM",
            callback_data: "menu_ukm",
          },
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
  };

  if (messageId) {
    return telegram(
      "editMessageText",
      {
        ...body,
        message_id: messageId,
      }
    );
  }

  return telegram(
    "sendMessage",
    body
  );
}

/* =====================================================
   MENU UKP
===================================================== */

async function sendUKPMenu(
  chatId: number,
  messageId: number
) {
  return telegram(
    "editMessageText",
    {
      chat_id: chatId,
      message_id: messageId,

      text:
        "🩺 <b>UKP</b>\n\n" +
        "Pilih tindakan yang ingin dilakukan:",

      parse_mode: "HTML",

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
    }
  );
}

/* =====================================================
   MULAI INPUT UKP
===================================================== */

async function startUKP(
  chatId: number,
  messageId: number
) {
  sessions.set(
    chatId,
    {
      step: "ukp_tanggal",
      data: {},
    }
  );

  return telegram(
    "editMessageText",
    {
      chat_id: chatId,
      message_id: messageId,

      text:
        "🩺 <b>Input UKP</b>\n\n" +
        "Kita akan mengisi data UKP secara bertahap.\n\n" +
        "📅 <b>Tanggal pelayanan</b>\n\n" +
        "Silakan pilih:",

      parse_mode: "HTML",

      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "📅 Hari Ini",
              callback_data:
                "ukp_date_today",
            },
          ],
          [
            {
              text: "✏️ Masukkan Tanggal",
              callback_data:
                "ukp_date_manual",
            },
          ],
          [
            {
              text: "❌ Batalkan",
              callback_data:
                "menu_start",
            },
          ],
        ],
      },
    }
  );
}

/* =====================================================
   NO RM
===================================================== */

async function askNoRM(
  chatId: number,
  messageId?: number
) {
  const body = {
    chat_id: chatId,
    text:
      "🧾 <b>No. RM</b>\n\n" +
      "Masukkan nomor rekam medis pasien.\n\n" +
      "⚠️ Data ini wajib diisi.",
    parse_mode: "HTML",
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
  };

  if (messageId) {
    return telegram("editMessageText", {
      ...body,
      message_id: messageId,
    });
  }

  return telegram(
    "sendMessage",
    body
  );
}

/* =====================================================
   INISIAL PASIEN
===================================================== */

async function askInisialPasien(
  chatId: number
) {
  return telegram(
    "sendMessage",
    {
      chat_id: chatId,

      text:
        "👤 <b>Inisial pasien</b>\n\n" +
        "Masukkan inisial pasien.\n\n" +
        "Contoh: <code>AN</code>\n\n" +
        "⚠️ Data ini wajib diisi.",

      parse_mode: "HTML",

      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "❌ Batalkan",
              callback_data:
                "menu_start",
            },
          ],
        ],
      },
    }
  );
}

/* =====================================================
   JENIS TINDAKAN
===================================================== */

async function askJenisTindakan(
  chatId: number
) {
  return telegram(
    "sendMessage",
    {
      chat_id: chatId,

      text:
        "🩺 <b>Jenis tindakan</b>\n\n" +
        "Pilih jenis tindakan:",

      parse_mode: "HTML",

      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Medik",
              callback_data:
                "ukp_action_medik",
            },
            {
              text: "Bedah",
              callback_data:
                "ukp_action_bedah",
            },
          ],
          [
            {
              text: "Kegawatdaruratan",
              callback_data:
                "ukp_action_emergency",
            },
          ],
          [
            {
              text: "Kejiwaan",
              callback_data:
                "ukp_action_psychiatry",
            },
          ],
          [
            {
              text: "Medikolegal",
              callback_data:
                "ukp_action_medikolegal",
            },
          ],
          [
            {
              text: "Kebidanan-Perinatal",
              callback_data:
                "ukp_action_obgyn",
            },
          ],
          [
            {
              text: "❌ Batalkan",
              callback_data:
                "menu_start",
            },
          ],
        ],
      },
    }
  );
}

/* =====================================================
   SUMBER DATA
===================================================== */

async function askSumberData(
  chatId: number
) {
  return telegram(
    "sendMessage",
    {
      chat_id: chatId,

      text:
        "📂 <b>Sumber data</b>\n\n" +
        "Pilih sumber data pasien:",

      parse_mode: "HTML",

      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🚑 Rawat Darurat",
              callback_data:
                "ukp_source_emergency",
            },
          ],
          [
            {
              text: "🏥 Rawat Inap",
              callback_data:
                "ukp_source_inpatient",
            },
          ],
          [
            {
              text: "🏠 Rawat Jalan",
              callback_data:
                "ukp_source_outpatient",
            },
          ],
        ],
      },
    }
  );
}

/* =====================================================
   JENIS KELAMIN
===================================================== */

async function askJenisKelamin(
  chatId: number
) {
  return telegram(
    "sendMessage",
    {
      chat_id: chatId,

      text:
        "👤 <b>Jenis kelamin</b>\n\n" +
        "Pilih jenis kelamin pasien:",

      parse_mode: "HTML",

      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "👨 Laki-laki",
              callback_data:
                "ukp_gender_male",
            },
            {
              text: "👩 Perempuan",
              callback_data:
                "ukp_gender_female",
            },
          ],
        ],
      },
    }
  );
}

/* =====================================================
   KATEGORI PASIEN
===================================================== */

async function askKategoriPasien(
  chatId: number
) {
  return telegram(
    "sendMessage",
    {
      chat_id: chatId,

      text:
        "👶 <b>Kategori pasien</b>\n\n" +
        "Pilih kategori pasien:",

      parse_mode: "HTML",

      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "👶 Bayi-Anak",
              callback_data:
                "ukp_patient_child",
            },
          ],
          [
            {
              text: "🧑 Dewasa",
              callback_data:
                "ukp_patient_adult",
            },
          ],
          [
            {
              text: "👴 Lansia",
              callback_data:
                "ukp_patient_elderly",
            },
          ],
        ],
      },
    }
  );
}

/* =====================================================
   KATEGORI KASUS
===================================================== */

async function askKategoriKasus(
  chatId: number
) {
  return telegram(
    "sendMessage",
    {
      chat_id: chatId,

      text:
        "🦠 <b>Kategori kasus</b>\n\n" +
        "Pilih kategori kasus:",

      parse_mode: "HTML",

      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Non-COVID",
              callback_data:
                "ukp_case_non_covid",
            },
          ],
          [
            {
              text: "Suspect",
              callback_data:
                "ukp_case_suspect",
            },
            {
              text: "Probable",
              callback_data:
                "ukp_case_probable",
            },
          ],
          [
            {
              text: "Kontak Erat",
              callback_data:
                "ukp_case_close_contact",
            },
          ],
          [
            {
              text: "Konfirmasi",
              callback_data:
                "ukp_case_confirmed",
            },
          ],
        ],
      },
    }
  );
}

/* =====================================================
   STATUS RUJUKAN
===================================================== */

async function askStatusRujukan(
  chatId: number
) {
  return telegram(
    "sendMessage",
    {
      chat_id: chatId,

      text:
        "🚑 <b>Status rujukan</b>\n\n" +
        "Apakah pasien dirujuk?",

      parse_mode: "HTML",

      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🚑 Rujuk",
              callback_data:
                "ukp_referral_yes",
            },
            {
              text: "🏠 Tidak Rujuk",
              callback_data:
                "ukp_referral_no",
            },
          ],
        ],
      },
    }
  );
}

/* =====================================================
   REVIEW DATA
===================================================== */

async function showUKPReview(
  chatId: number,
  messageId?: number
) {
  const session =
    sessions.get(chatId);

  if (!session) {
    return telegram(
      "sendMessage",
      {
        chat_id: chatId,

        text:
          "⚠️ Data UKP tidak ditemukan.\n\n" +
          "Silakan mulai input UKP dari awal.",
      }
    );
  }

  const d =
    session.data;

  const text =
    "📋 <b>REVIEW DATA UKP</b>\n\n" +

    `📅 <b>Tanggal pelayanan:</b> ${escapeHtml(
      formatDateIndonesia(
        d.tanggal_pelayanan
      )
    )}\n` +

    `🧾 <b>No. RM:</b> ${escapeHtml(
      d.no_rm
    )}\n` +

    `👤 <b>Inisial pasien:</b> ${escapeHtml(
      d.inisial_pasien
    )}\n` +

    `🩺 <b>Jenis tindakan:</b> ${escapeHtml(
      d.jenis_tindakan
    )}\n` +

    `📂 <b>Sumber data:</b> ${escapeHtml(
      d.sumber_data
    )}\n` +

    `👤 <b>Jenis kelamin:</b> ${escapeHtml(
      d.jenis_kelamin
    )}\n` +

    `👶 <b>Kategori pasien:</b> ${escapeHtml(
      d.kategori_pasien
    )}\n` +

    `🦠 <b>Kategori kasus:</b> ${escapeHtml(
      d.kategori_kasus
    )}\n` +

    `📏 <b>TB:</b> ${escapeHtml(
      d.tb
    )} cm\n` +

    `⚖️ <b>BB:</b> ${escapeHtml(
      d.bb
    )} kg\n\n` +

    `📝 <b>Anamnesis:</b>\n${escapeHtml(
      d.anamnesis
    )}\n\n` +

    `🔬 <b>Pemeriksaan fisik:</b>\n${escapeHtml(
      d.pemeriksaan_fisik
    )}\n\n` +

    `🧪 <b>Pemeriksaan penunjang:</b>\n${escapeHtml(
      d.pemeriksaan_penunjang
    )}\n\n` +

    `🩺 <b>Diagnosis:</b>\n${escapeHtml(
      d.diagnosis
    )}\n\n` +

    `💊 <b>Farmakoterapi:</b>\n${escapeHtml(
      d.farmakoterapi
    )}\n\n` +

    `🩹 <b>Non-farmakoterapi:</b>\n${escapeHtml(
      d.non_farmakoterapi
    )}\n\n` +

    `📊 <b>Monitoring & evaluasi:</b>\n${escapeHtml(
      d.monitoring_evaluasi
    )}\n\n` +

    `🔍 <b>Diagnosis banding:</b>\n${escapeHtml(
      d.diagnosis_banding
    )}\n\n` +

    `🚑 <b>Status rujukan:</b> ${escapeHtml(
      d.status_rujukan
    )}\n\n` +

    "Jika semua data sudah benar, tekan tombol " +
    "<b>Simpan ke Logbook</b>.";

  const body = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",

    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "💾 Simpan ke Logbook",
            callback_data:
              "ukp_save",
          },
        ],
        [
          {
            text: "❌ Batalkan",
            callback_data:
              "menu_start",
          },
        ],
      ],
    },
  };

  if (messageId) {
    return telegram(
      "editMessageText",
      {
        ...body,
        message_id:
          messageId,
      }
    );
  }

  return telegram(
    "sendMessage",
    body
  );
}

/* =====================================================
   POST WEBHOOK
===================================================== */

export async function POST(
  request: Request
) {
  try {
    const update =
      await request.json();

    console.log(
      "Telegram update:",
      update
    );

    /* =================================================
       CALLBACK QUERY
    ================================================= */

    if (update.callback_query) {
      const callback =
        update.callback_query;

      const callbackId =
        callback.id;

      const callbackData =
        callback.data;

      const callbackChatId =
        callback.message?.chat?.id;

      const callbackMessageId =
        callback.message?.message_id;

      await telegram(
        "answerCallbackQuery",
        {
          callback_query_id:
            callbackId,
        }
      );

      if (
        !callbackChatId ||
        !callbackMessageId
      ) {
        return NextResponse.json({
          ok: true,
        });
      }

      /* ===============================================
         MENU UTAMA
      =============================================== */

      if (
        callbackData ===
        "menu_start"
      ) {
        sessions.delete(
          callbackChatId
        );

        await sendMainMenu(
          callbackChatId,
          callbackMessageId
        );

        return NextResponse.json({
          ok: true,
        });
      }

      /* ===============================================
         MENU UKP
      =============================================== */

      if (
        callbackData ===
        "menu_ukp"
      ) {
        await sendUKPMenu(
          callbackChatId,
          callbackMessageId
        );

        return NextResponse.json({
          ok: true,
        });
      }

      /* ===============================================
         INPUT UKP
      =============================================== */

      if (
        callbackData ===
        "ukp_input"
      ) {
        await startUKP(
          callbackChatId,
          callbackMessageId
        );

        return NextResponse.json({
          ok: true,
        });
      }

      /* ===============================================
         TANGGAL HARI INI
      =============================================== */

      if (
        callbackData ===
        "ukp_date_today"
      ) {
        const session =
          sessions.get(
            callbackChatId
          );

        if (!session) {
          await sendMainMenu(
            callbackChatId,
            callbackMessageId
          );

          return NextResponse.json({
            ok: true,
          });
        }

        session.data
          .tanggal_pelayanan =
          getTodayJakarta();

        session.step =
          "ukp_no_rm";

        await askNoRM(
          callbackChatId,
          callbackMessageId
        );

        return NextResponse.json({
          ok: true,
        });
      }

      /* ===============================================
         TANGGAL MANUAL
      =============================================== */

      if (
        callbackData ===
        "ukp_date_manual"
      ) {
        const session =
          sessions.get(
            callbackChatId
          );

        if (!session) {
          await sendMainMenu(
            callbackChatId,
            callbackMessageId
          );

          return NextResponse.json({
            ok: true,
          });
        }

        session.step =
          "ukp_tanggal_manual";

        await telegram(
          "editMessageText",
          {
            chat_id:
              callbackChatId,

            message_id:
              callbackMessageId,

            text:
              "📅 <b>Tanggal pelayanan</b>\n\n" +
              "Ketik tanggal pelayanan dengan format:\n\n" +
              "<code>07/10/2026</code>\n\n" +
              "⚠️ Data ini wajib diisi.",

            parse_mode: "HTML",

            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "❌ Batalkan",
                    callback_data:
                      "menu_start",
                  },
                ],
              ],
            },
          }
        );

        return NextResponse.json({
          ok: true,
        });
      }

      /* ===============================================
         JENIS TINDAKAN
      =============================================== */

      const actionMap:
        Record<string, string> = {
          ukp_action_medik:
            "Medik",

          ukp_action_bedah:
            "Bedah",

          ukp_action_emergency:
            "Kegawatdaruratan",

          ukp_action_psychiatry:
            "Kejiwaan",

          ukp_action_medikolegal:
            "Medikolegal",

          ukp_action_obgyn:
            "Kebidanan-Perinatal",
        };

      if (
        actionMap[callbackData]
      ) {
        const session =
          sessions.get(
            callbackChatId
          );

        if (!session) {
          return NextResponse.json({
            ok: true,
          });
        }

        session.data
          .jenis_tindakan =
          actionMap[callbackData];

        session.step =
          "ukp_sumber_data";

        await askSumberData(
          callbackChatId
        );

        return NextResponse.json({
          ok: true,
        });
      }

      /* ===============================================
         SUMBER DATA
      =============================================== */

      const sourceMap:
        Record<string, string> = {
          ukp_source_emergency:
            "Rawat Darurat",

          ukp_source_inpatient:
            "Rawat Inap",

          ukp_source_outpatient:
            "Rawat Jalan",
        };

      if (
        sourceMap[callbackData]
      ) {
        const session =
          sessions.get(
            callbackChatId
          );

        if (!session) {
          return NextResponse.json({
            ok: true,
          });
        }

        session.data
          .sumber_data =
          sourceMap[callbackData];

        session.step =
          "ukp_jenis_kelamin";

        await askJenisKelamin(
          callbackChatId
        );

        return NextResponse.json({
          ok: true,
        });
      }

      /* ===============================================
         JENIS KELAMIN
      =============================================== */

      const genderMap:
        Record<string, string> = {
          ukp_gender_male:
            "Laki-laki",

          ukp_gender_female:
            "Perempuan",
        };

      if (
        genderMap[callbackData]
      ) {
        const session =
          sessions.get(
            callbackChatId
          );

        if (!session) {
          return NextResponse.json({
            ok: true,
          });
        }

        session.data
          .jenis_kelamin =
          genderMap[callbackData];

        session.step =
          "ukp_kategori_pasien";

        await askKategoriPasien(
          callbackChatId
        );

        return NextResponse.json({
          ok: true,
        });
      }

      /* ===============================================
         KATEGORI PASIEN
      =============================================== */

      const patientMap:
        Record<string, string> = {
          ukp_patient_child:
            "Bayi-Anak",

          ukp_patient_adult:
            "Dewasa",

          ukp_patient_elderly:
            "Lansia",
        };

      if (
        patientMap[callbackData]
      ) {
        const session =
          sessions.get(
            callbackChatId
          );

        if (!session) {
          return NextResponse.json({
            ok: true,
          });
        }

        session.data
          .kategori_pasien =
          patientMap[callbackData];

        session.step =
          "ukp_kategori_kasus";

        await askKategoriKasus(
          callbackChatId
        );

        return NextResponse.json({
          ok: true,
        });
      }

      /* ===============================================
         KATEGORI KASUS
      =============================================== */

      const caseMap:
        Record<string, string> = {
          ukp_case_non_covid:
            "Non-COVID",

          ukp_case_suspect:
            "Suspect",

          ukp_case_probable:
            "Probable",

          ukp_case_close_contact:
            "Kontak Erat",

          ukp_case_confirmed:
            "Konfirmasi",
        };

      if (
        caseMap[callbackData]
      ) {
        const session =
          sessions.get(
            callbackChatId
          );

        if (!session) {
          return NextResponse.json({
            ok: true,
          });
        }

        session.data
          .kategori_kasus =
          caseMap[callbackData];

        session.step =
          "ukp_tb";

        await telegram(
          "sendMessage",
          {
            chat_id:
              callbackChatId,

            text:
              "📏 <b>Tinggi badan (TB)</b>\n\n" +
              "Masukkan TB pasien dalam cm.\n\n" +
              "Contoh: <code>165</code>\n\n" +
              "⚠️ Data ini wajib diisi.",

            parse_mode: "HTML",

            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "❌ Batalkan",
                    callback_data:
                      "menu_start",
                  },
                ],
              ],
            },
          }
        );

        return NextResponse.json({
          ok: true,
        });
      }

      /* ===============================================
         STATUS RUJUKAN
      =============================================== */

      const referralMap:
        Record<string, string> = {
          ukp_referral_yes:
            "Rujuk",

          ukp_referral_no:
            "Tidak Rujuk",
        };

      if (
        referralMap[callbackData]
      ) {
        const session =
          sessions.get(
            callbackChatId
          );

        if (!session) {
          return NextResponse.json({
            ok: true,
          });
        }

        session.data
          .status_rujukan =
          referralMap[callbackData];

        session.step =
          "ukp_review";

        await showUKPReview(
          callbackChatId
        );

        return NextResponse.json({
          ok: true,
        });
      }

      /* ===============================================
         SIMPAN UKP
      =============================================== */

      if (
        callbackData ===
        "ukp_save"
      ) {
        const session =
          sessions.get(
            callbackChatId
          );

        if (!session) {
          await telegram(
            "sendMessage",
            {
              chat_id:
                callbackChatId,

              text:
                "⚠️ <b>Data UKP tidak ditemukan.</b>\n\n" +
                "Silakan mulai input UKP dari awal.",

              parse_mode:
                "HTML",
            }
          );

          return NextResponse.json({
            ok: true,
          });
        }

        try {
         
await saveUKPToSupabase(
  session.data,
  callbackChatId
);

          console.log(
            "UKP BERHASIL DISIMPAN:",
            session.data
          );

          sessions.delete(
            callbackChatId
          );

          await telegram(
            "editMessageText",
            {
              chat_id:
                callbackChatId,

              message_id:
                callbackMessageId,

              text:
                "✅ <b>Data UKP berhasil disimpan ke Logbook!</b>\n\n" +
                "Data sudah masuk ke database.\n\n" +
                "Silakan pilih tindakan berikutnya:",

              parse_mode:
                "HTML",

              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "➕ Input UKP Baru",
                      callback_data:
                        "ukp_input",
                    },
                  ],
                  [
                    {
                      text: "🏠 Menu Utama",
                      callback_data:
                        "menu_start",
                    },
                  ],
                ],
              },
            }
          );
        } catch (saveError) {
          console.error(
            "Gagal menyimpan UKP:",
            saveError
          );

          await telegram(
            "editMessageText",
            {
              chat_id:
                callbackChatId,

              message_id:
                callbackMessageId,

              text:
                "❌ <b>Data belum berhasil disimpan.</b>\n\n" +
                "Terjadi masalah saat menyimpan ke database.\n\n" +
                "Data kamu masih ada di sesi bot. Jangan mulai ulang dulu.",

              parse_mode:
                "HTML",

              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "🔄 Coba Simpan Lagi",
                      callback_data:
                        "ukp_save",
                    },
                  ],
                  [
                    {
                      text: "🏠 Menu Utama",
                      callback_data:
                        "menu_start",
                    },
                  ],
                ],
              },
            }
          );
        }

        return NextResponse.json({
          ok: true,
        });
      }

      /* ===============================================
         MENU UKM
      =============================================== */

      if (
        callbackData ===
        "menu_ukm"
      ) {
        await telegram(
          "editMessageText",
          {
            chat_id:
              callbackChatId,

            message_id:
              callbackMessageId,

            text:
              "🌱 <b>UKM</b>\n\n" +
              "Fitur UKM akan kita lanjutkan setelah alur UKP selesai.",

            parse_mode:
              "HTML",

            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "⬅️ Kembali",
                    callback_data:
                      "menu_start",
                  },
                ],
              ],
            },
          }
        );

        return NextResponse.json({
          ok: true,
        });
      }

      /* ===============================================
         MENU TINDAKAN
      =============================================== */

      if (
        callbackData ===
        "menu_tindakan"
      ) {
        await telegram(
          "editMessageText",
          {
            chat_id:
              callbackChatId,

            message_id:
              callbackMessageId,

            text:
              "💉 <b>Tindakan Medis</b>\n\n" +
              "Fitur ini akan kita lanjutkan setelah UKP.",

            parse_mode:
              "HTML",

            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "⬅️ Kembali",
                    callback_data:
                      "menu_start",
                  },
                ],
              ],
            },
          }
        );

        return NextResponse.json({
          ok: true,
        });
      }

      /* ===============================================
         MENU MINI PROJECT
      =============================================== */

      if (
        callbackData ===
        "menu_miniproject"
      ) {
        await telegram(
          "editMessageText",
          {
            chat_id:
              callbackChatId,

            message_id:
              callbackMessageId,

            text:
              "📋 <b>Mini Project</b>\n\n" +
              "Fitur ini akan kita lanjutkan setelah UKP.",

            parse_mode:
              "HTML",

            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "⬅️ Kembali",
                    callback_data:
                      "menu_start",
                  },
                ],
              ],
            },
          }
        );

        return NextResponse.json({
          ok: true,
        });
      }

      return NextResponse.json({
        ok: true,
      });
    }

    /* =================================================
       PESAN BIASA
    ================================================= */

    const incomingMessage =
      update.message;

    if (
      !incomingMessage?.chat?.id
    ) {
      return NextResponse.json({
        ok: true,
      });
    }

    const chatId =
      incomingMessage.chat.id;

    const text =
      incomingMessage.text?.trim() ||
      "";

    /* =================================================
       /START
    ================================================= */

    if (text === "/start") {
      sessions.delete(chatId);

      await sendMainMenu(
        chatId
      );

      return NextResponse.json({
        ok: true,
      });
    }

    /* =================================================
       SESSION
    ================================================= */

    const session =
      sessions.get(chatId);

    if (session) {

      /* ===============================================
         TANGGAL MANUAL
      =============================================== */

      if (
        session.step ===
        "ukp_tanggal_manual"
      ) {
        const match =
          text.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
          );

        if (!match) {
          await telegram(
            "sendMessage",
            {
              chat_id: chatId,

              text:
                "❌ Format tanggal tidak sesuai.\n\n" +
                "Gunakan format:\n" +
                "<code>07/10/2026</code>",

              parse_mode:
                "HTML",
            }
          );

          return NextResponse.json({
            ok: true,
          });
        }

        const day =
          Number(match[1]);

        const month =
          Number(match[2]);

        const year =
          Number(match[3]);

        const date =
          new Date(
            Date.UTC(
              year,
              month - 1,
              day
            )
          );

        if (
          date.getUTCFullYear() !==
            year ||
          date.getUTCMonth() !==
            month - 1 ||
          date.getUTCDate() !==
            day
        ) {
          await telegram(
            "sendMessage",
            {
              chat_id: chatId,

              text:
                "❌ Tanggal tidak valid.\n\n" +
                "Silakan masukkan tanggal yang benar.",

              parse_mode:
                "HTML",
            }
          );

          return NextResponse.json({
            ok: true,
          });
        }

        session.data
          .tanggal_pelayanan =
          `${year}-${String(
            month
          ).padStart(
            2,
            "0"
          )}-${String(
            day
          ).padStart(
            2,
            "0"
          )}`;

        session.step =
          "ukp_no_rm";

        await askNoRM(
          chatId
        );

        return NextResponse.json({
          ok: true,
        });
      }

      /* ===============================================
         NO RM
      =============================================== */

      if (
        session.step ===
        "ukp_no_rm"
      ) {
        if (!text) {
          await telegram(
            "sendMessage",
            {
              chat_id: chatId,

              text:
                "⚠️ <b>No. RM wajib diisi.</b>\n\n" +
                "Silakan masukkan nomor rekam medis pasien.",

              parse_mode:
                "HTML",
            }
          );

          return NextResponse.json({
            ok: true,
          });
        }

        session.data.no_rm =
          text;

        session.step =
          "ukp_inisial_pasien";

        await askInisialPasien(
          chatId
        );

        return NextResponse.json({
          ok: true,
        });
      }

      /* ===============================================
         INISIAL PASIEN
      =============================================== */

      if (
        session.step ===
        "ukp_inisial_pasien"
      ) {
        if (!text) {
          await telegram(
            "sendMessage",
            {
              chat_id: chatId,

              text:
                "⚠️ <b>Inisial pasien wajib diisi.</b>\n\n" +
                "Contoh: <code>AN</code>",

              parse_mode:
                "HTML",
            }
          );

          return NextResponse.json({
            ok: true,
          });
        }

        session.data
          .inisial_pasien =
          text.toUpperCase();

        session.step =
          "ukp_jenis_tindakan";

        await askJenisTindakan(
          chatId
        );

        return NextResponse.json({
          ok: true,
        });
      }

      /* ===============================================
         TB
      =============================================== */

      if (
        session.step ===
        "ukp_tb"
      ) {
        const tb =
          Number(
            text.replace(
              ",",
              "."
            )
          );

        if (
          !Number.isFinite(tb) ||
          tb <= 0 ||
          tb > 300
        ) {
          await telegram(
            "sendMessage",
            {
              chat_id: chatId,

              text:
                "❌ TB tidak valid.\n\n" +
                "Masukkan TB dalam cm.\n" +
                "Contoh: <code>165</code>",

              parse_mode:
                "HTML",
            }
          );

          return NextResponse.json({
            ok: true,
          });
        }

        session.data.tb =
          String(tb);

        session.step =
          "ukp_bb";

        await telegram(
          "sendMessage",
          {
            chat_id: chatId,

            text:
              "⚖️ <b>Berat badan (BB)</b>\n\n" +
              "Masukkan BB pasien dalam kg.\n\n" +
              "Contoh: <code>55.5</code>\n\n" +
              "⚠️ Data ini wajib diisi.",

            parse_mode:
              "HTML",

            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "❌ Batalkan",
                    callback_data:
                      "menu_start",
                  },
                ],
              ],
            },
          }
        );

        return NextResponse.json({
          ok: true,
        });
      }

      /* ===============================================
         BB
      =============================================== */

      if (
        session.step ===
        "ukp_bb"
      ) {
        const bb =
          Number(
            text.replace(
              ",",
              "."
            )
          );

        if (
          !Number.isFinite(bb) ||
          bb <= 0 ||
          bb > 500
        ) {
          await telegram(
            "sendMessage",
            {
              chat_id: chatId,

              text:
                "❌ BB tidak valid.\n\n" +
                "Masukkan BB dalam kg.\n" +
                "Contoh: <code>55.5</code>",

              parse_mode:
                "HTML",
            }
          );

          return NextResponse.json({
            ok: true,
          });
        }

        session.data.bb =
          String(bb);

        session.step =
          "ukp_anamnesis";

        await telegram(
          "sendMessage",
          {
            chat_id: chatId,

            text:
              "📝 <b>Anamnesis</b>\n\n" +
              "Masukkan anamnesis pasien secara lengkap.\n\n" +
              "⚠️ Data ini wajib diisi.",

            parse_mode:
              "HTML",
          }
        );

        return NextResponse.json({
          ok: true,
        });
      }

      /* ===============================================
         ANAMNESIS
      =============================================== */

      if (
        session.step ===
        "ukp_anamnesis"
      ) {
        if (!text) {
          await telegram(
            "sendMessage",
            {
              chat_id: chatId,

              text:
                "⚠️ <b>Anamnesis wajib diisi.</b>\n\n" +
                "Silakan masukkan anamnesis pasien.",

              parse_mode:
                "HTML",
            }
          );

          return NextResponse.json({
            ok: true,
          });
        }

        session.data.anamnesis =
          text;

        session.step =
          "ukp_pemeriksaan_fisik";

        await telegram(
          "sendMessage",
          {
            chat_id: chatId,

            text:
              "🔬 <b>Pemeriksaan fisik</b>\n\n" +
              "Masukkan hasil pemeriksaan fisik.\n\n" +
              "⚠️ Data ini wajib diisi.",

            parse_mode:
              "HTML",
          }
        );

        return NextResponse.json({
          ok: true,
        });
      }

      /* ===============================================
         PEMERIKSAAN FISIK
      =============================================== */

      if (
        session.step ===
        "ukp_pemeriksaan_fisik"
      ) {
        if (!text) {
          await telegram(
            "sendMessage",
            {
              chat_id: chatId,

              text:
                "⚠️ <b>Pemeriksaan fisik wajib diisi.</b>\n\n" +
                "Silakan masukkan hasil pemeriksaan fisik.",

              parse_mode:
                "HTML",
            }
          );

          return NextResponse.json({
            ok: true,
          });
        }

        session.data
          .pemeriksaan_fisik =
          text;

        session.step =
          "ukp_pemeriksaan_penunjang";

        await telegram(
          "sendMessage",
          {
            chat_id: chatId,

            text:
              "🧪 <b>Pemeriksaan penunjang</b>\n\n" +
              "Masukkan hasil pemeriksaan penunjang.\n\n" +
              "Jika tidak ada, ketik <code>Tidak ada</code>.\n\n" +
              "⚠️ Field ini tetap wajib diisi.",

            parse_mode:
              "HTML",
          }
        );

        return NextResponse.json({
          ok: true,
        });
      }

      /* ===============================================
         PEMERIKSAAN PENUNJANG
      =============================================== */

      if (
        session.step ===
        "ukp_pemeriksaan_penunjang"
      ) {
        if (!text) {
          await telegram(
            "sendMessage",
            {
              chat_id: chatId,

              text:
                "⚠️ <b>Pemeriksaan penunjang wajib diisi.</b>\n\n" +
                "Jika tidak ada pemeriksaan penunjang, ketik <code>Tidak ada</code>.",

              parse_mode:
                "HTML",
            }
          );

          return NextResponse.json({
            ok: true,
          });
        }

        session.data
          .pemeriksaan_penunjang =
          text;

        session.step =
          "ukp_diagnosis";

        await telegram(
          "sendMessage",
          {
            chat_id: chatId,

            text:
              "🩺 <b>Diagnosis</b>\n\n" +
              "Masukkan diagnosis utama pasien.\n\n" +
              "⚠️ Diagnosis wajib diisi.",

            parse_mode:
              "HTML",
          }
        );

        return NextResponse.json({
          ok: true,
        });
      }

      /* ===============================================
         DIAGNOSIS
      =============================================== */

      if (
        session.step ===
        "ukp_diagnosis"
      ) {
        if (!text) {
          await telegram(
            "sendMessage",
            {
              chat_id: chatId,

              text:
                "⚠️ <b>Diagnosis wajib diisi.</b>\n\n" +
                "Silakan masukkan diagnosis pasien.",

              parse_mode:
                "HTML",
            }
          );

          return NextResponse.json({
            ok: true,
          });
        }

        session.data.diagnosis =
          text;

        session.step =
          "ukp_farmakoterapi";

        await telegram(
          "sendMessage",
          {
            chat_id: chatId,

            text:
              "💊 <b>Farmakoterapi</b>\n\n" +
              "Masukkan farmakoterapi yang diberikan.\n\n" +
              "Jika tidak ada, ketik <code>Tidak ada</code>.\n\n" +
              "⚠️ Field ini tetap wajib diisi.",

            parse_mode:
              "HTML",
          }
        );

        return NextResponse.json({
          ok: true,
        });
      }

      /* ===============================================
         FARMAKOTERAPI
      =============================================== */

      if (
        session.step ===
        "ukp_farmakoterapi"
      ) {
        if (!text) {
          await telegram(
            "sendMessage",
            {
              chat_id: chatId,

              text:
                "⚠️ <b>Farmakoterapi wajib diisi.</b>\n\n" +
                "Jika tidak ada, ketik <code>Tidak ada</code>.",

              parse_mode:
                "HTML",
            }
          );

          return NextResponse.json({
            ok: true,
          });
        }

        session.data
          .farmakoterapi =
          text;

        session.step =
          "ukp_non_farmakoterapi";

        await telegram(
          "sendMessage",
          {
            chat_id: chatId,

            text:
              "🩹 <b>Non-farmakoterapi</b>\n\n" +
              "Masukkan tatalaksana non-farmakoterapi.\n\n" +
              "Jika tidak ada, ketik <code>Tidak ada</code>.\n\n" +
              "⚠️ Field ini tetap wajib diisi.",

            parse_mode:
              "HTML",
          }
        );

        return NextResponse.json({
          ok: true,
        });
      }

      /* ===============================================
         NON FARMAKOTERAPI
      =============================================== */

      if (
        session.step ===
        "ukp_non_farmakoterapi"
      ) {
        if (!text) {
          await telegram(
            "sendMessage",
            {
              chat_id: chatId,

              text:
                "⚠️ <b>Non-farmakoterapi wajib diisi.</b>\n\n" +
                "Jika tidak ada, ketik <code>Tidak ada</code>.",

              parse_mode:
                "HTML",
            }
          );

          return NextResponse.json({
            ok: true,
          });
        }

        session.data
          .non_farmakoterapi =
          text;

        session.step =
          "ukp_monitoring_evaluasi";

        await telegram(
          "sendMessage",
          {
            chat_id: chatId,

            text:
              "📊 <b>Monitoring & Evaluasi</b>\n\n" +
              "Masukkan monitoring dan evaluasi pasien.\n\n" +
              "Jika belum ada, ketik <code>Tidak ada</code>.\n\n" +
              "⚠️ Field ini tetap wajib diisi.",

            parse_mode:
              "HTML",
          }
        );

        return NextResponse.json({
          ok: true,
        });
      }

      /* ===============================================
         MONITORING EVALUASI
      =============================================== */

      if (
        session.step ===
        "ukp_monitoring_evaluasi"
      ) {
        if (!text) {
          await telegram(
            "sendMessage",
            {
              chat_id: chatId,

              text:
                "⚠️ <b>Monitoring & evaluasi wajib diisi.</b>\n\n" +
                "Jika belum ada, ketik <code>Tidak ada</code>.",

              parse_mode:
                "HTML",
            }
          );

          return NextResponse.json({
            ok: true,
          });
        }

        session.data
          .monitoring_evaluasi =
          text;

        session.step =
          "ukp_diagnosis_banding";

        await telegram(
          "sendMessage",
          {
            chat_id: chatId,

            text:
              "🔍 <b>Diagnosis Banding</b>\n\n" +
              "Masukkan diagnosis banding.\n\n" +
              "Jika tidak ada, ketik <code>Tidak ada</code>.\n\n" +
              "⚠️ Field ini tetap wajib diisi.",

            parse_mode:
              "HTML",
          }
        );

        return NextResponse.json({
          ok: true,
        });
      }

      /* ===============================================
         DIAGNOSIS BANDING
      =============================================== */

      if (
        session.step ===
        "ukp_diagnosis_banding"
      ) {
        if (!text) {
          await telegram(
            "sendMessage",
            {
              chat_id: chatId,

              text:
                "⚠️ <b>Diagnosis banding wajib diisi.</b>\n\n" +
                "Jika tidak ada, ketik <code>Tidak ada</code>.",

              parse_mode:
                "HTML",
            }
          );

          return NextResponse.json({
            ok: true,
          });
        }

        session.data
          .diagnosis_banding =
          text;

        session.step =
          "ukp_status_rujukan";

        await askStatusRujukan(
          chatId
        );

        return NextResponse.json({
          ok: true,
        });
      }

      /* ===============================================
         REVIEW
      =============================================== */

      if (
        session.step ===
        "ukp_review"
      ) {
        await showUKPReview(
          chatId
        );

        return NextResponse.json({
          ok: true,
        });
      }

      /* ===============================================
         SESSION TIDAK DIKENALI
      =============================================== */

      sessions.delete(chatId);

      await telegram(
        "sendMessage",
        {
          chat_id: chatId,

          text:
            "⚠️ Sesi input tidak dikenali.\n\n" +
            "Silakan mulai kembali dari menu utama.",

          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🏠 Menu Utama",
                  callback_data:
                    "menu_start",
                },
              ],
            ],
          },
        }
      );

      return NextResponse.json({
        ok: true,
      });
    }

    /* =================================================
       PESAN LAIN
    ================================================= */

    await telegram(
      "sendMessage",
      {
        chat_id: chatId,

        text:
          "Aku belum memahami pesan tersebut 😅\n\n" +
          "Ketik /start untuk membuka menu Logbook Internsip.",

        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🏠 Menu Utama",
                callback_data:
                  "menu_start",
              },
            ],
          ],
        },
      }
    );

    return NextResponse.json({
      ok: true,
    });

  } catch (error) {
    console.error(
      "Telegram webhook error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}