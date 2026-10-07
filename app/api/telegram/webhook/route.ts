import { NextResponse } from "next/server";

type Session = {
  step: string;
  data: Record<string, string>;
};

const sessions = new Map<number, Session>();

// =====================================================
// TELEGRAM API
// =====================================================

function getTelegramApi() {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN belum diatur");
  }

  return `https://api.telegram.org/bot${token}`;
}

async function telegram(method: string, body: any) {
  const response = await fetch(`${getTelegramApi()}/${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const result = await response.json();

  console.log(`Telegram ${method}:`, result);

  return result;
}

// =====================================================
// MENU UTAMA
// =====================================================

async function showMainMenu(chatId: number, messageId?: number) {
  const payload = {
    chat_id: chatId,
    text:
      "🩺 *Logbook Internsip Kemenkes*\n\n" +
      "Silakan pilih jenis kegiatan yang ingin kamu input:",
    parse_mode: "Markdown",
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
    return telegram("editMessageText", {
      ...payload,
      message_id: messageId,
    });
  }

  return telegram("sendMessage", payload);
}

// =====================================================
// MENU UKP
// =====================================================

async function showUkpMenu(chatId: number, messageId: number) {
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
}

// =====================================================
// MULAI INPUT UKP
// =====================================================

async function startUkp(chatId: number, messageId: number) {
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
      "📅 *Tanggal pelayanan*\n\n" +
      "Silakan pilih:",
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "📅 Hari Ini",
            callback_data: "ukp_tanggal_hari_ini",
          },
        ],
        [
          {
            text: "📝 Masukkan tanggal",
            callback_data: "ukp_tanggal_manual",
          },
        ],
        [
          {
            text: "❌ Batalkan",
            callback_data: "menu_start",
          },
        ],
      ],
    },
  });
}

// =====================================================
// FORMAT TANGGAL
// =====================================================

function getToday() {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();

  return `${day}/${month}/${year}`;
}

// =====================================================
// PERTANYAAN NO RM
// =====================================================

async function askNoRm(chatId: number) {
  const session = sessions.get(chatId);

  if (!session) return;

  session.step = "ukp_no_rm";

  await telegram("sendMessage", {
    chat_id: chatId,
    text:
      "✅ Tanggal pelayanan dicatat.\n\n" +
      "🪪 *Nomor Rekam Medis*\n\n" +
      "Masukkan No. RM pasien.",
    parse_mode: "Markdown",
  });
}

// =====================================================
// JENIS TINDAKAN
// =====================================================

async function askJenisTindakan(chatId: number) {
  const session = sessions.get(chatId);

  if (!session) return;

  session.step = "ukp_jenis_tindakan";

  await telegram("sendMessage", {
    chat_id: chatId,
    text:
      "🩺 *Jenis tindakan*\n\n" +
      "Pilih jenis tindakan:",
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Medik",
            callback_data: "ukp_jenis_medik",
          },
        ],
        [
          {
            text: "Bawah",
            callback_data: "ukp_jenis_bawah",
          },
        ],
        [
          {
            text: "Kegawatdaruratan",
            callback_data: "ukp_jenis_kegawatdaruratan",
          },
        ],
        [
          {
            text: "Kejiwaan",
            callback_data: "ukp_jenis_kejiwaan",
          },
        ],
        [
          {
            text: "Medikolegal",
            callback_data: "ukp_jenis_medikolegal",
          },
        ],
        [
          {
            text: "Kebidanan-Perinatal",
            callback_data: "ukp_jenis_kebidanan",
          },
        ],
      ],
    },
  });
}

// =====================================================
// SUMBER DATA
// =====================================================

async function askSumberData(chatId: number) {
  const session = sessions.get(chatId);

  if (!session) return;

  session.step = "ukp_sumber_data";

  await telegram("sendMessage", {
    chat_id: chatId,
    text:
      "📂 *Sumber data*\n\n" +
      "Pilih sumber data pasien:",
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🚑 Rawat Darurat",
            callback_data: "ukp_sumber_darurat",
          },
        ],
        [
          {
            text: "🏥 Rawat Inap",
            callback_data: "ukp_sumber_inap",
          },
        ],
        [
          {
            text: "🏠 Rawat Jalan",
            callback_data: "ukp_sumber_jalan",
          },
        ],
      ],
    },
  });
}

// =====================================================
// JENIS KELAMIN
// =====================================================

async function askJenisKelamin(chatId: number) {
  const session = sessions.get(chatId);

  if (!session) return;

  session.step = "ukp_jenis_kelamin";

  await telegram("sendMessage", {
    chat_id: chatId,
    text:
      "👤 *Jenis kelamin*\n\n" +
      "Pilih jenis kelamin pasien:",
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "👨 Laki-laki",
            callback_data: "ukp_kelamin_laki",
          },
          {
            text: "👩 Perempuan",
            callback_data: "ukp_kelamin_perempuan",
          },
        ],
      ],
    },
  });
}

// =====================================================
// KATEGORI PASIEN
// =====================================================

async function askKategoriPasien(chatId: number) {
  const session = sessions.get(chatId);

  if (!session) return;

  session.step = "ukp_kategori_pasien";

  await telegram("sendMessage", {
    chat_id: chatId,
    text:
      "👶 *Kategori pasien*\n\n" +
      "Pilih kategori pasien:",
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "👶 Bayi-Anak",
            callback_data: "ukp_pasien_bayi_anak",
          },
        ],
        [
          {
            text: "🧑 Dewasa",
            callback_data: "ukp_pasien_dewasa",
          },
        ],
        [
          {
            text: "👴 Lansia",
            callback_data: "ukp_pasien_lansia",
          },
        ],
      ],
    },
  });
}

// =====================================================
// KATEGORI KASUS
// =====================================================

async function askKategoriKasus(chatId: number) {
  const session = sessions.get(chatId);

  if (!session) return;

  session.step = "ukp_kategori_kasus";

  await telegram("sendMessage", {
    chat_id: chatId,
    text:
      "🦠 *Kategori kasus*\n\n" +
      "Pilih kategori kasus:",
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Non-COVID",
            callback_data: "ukp_kasus_non_covid",
          },
        ],
        [
          {
            text: "Suspect",
            callback_data: "ukp_kasus_suspect",
          },
        ],
        [
          {
            text: "Probable",
            callback_data: "ukp_kasus_probable",
          },
        ],
        [
          {
            text: "Kontak Erat",
            callback_data: "ukp_kasus_kontak_erat",
          },
        ],
        [
          {
            text: "Konfirmasi",
            callback_data: "ukp_kasus_konfirmasi",
          },
        ],
      ],
    },
  });
}

// =====================================================
// TB
// =====================================================

async function askTb(chatId: number) {
  const session = sessions.get(chatId);

  if (!session) return;

  session.step = "ukp_tb";

  await telegram("sendMessage", {
    chat_id: chatId,
    text:
      "🫁 *TB*\n\n" +
      "Apakah pasien merupakan kasus TB?",
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Ya",
            callback_data: "ukp_tb_ya",
          },
          {
            text: "Tidak",
            callback_data: "ukp_tb_tidak",
          },
        ],
      ],
    },
  });
}

// =====================================================
// BB
// =====================================================

async function askBb(chatId: number) {
  const session = sessions.get(chatId);

  if (!session) return;

  session.step = "ukp_bb";

  await telegram("sendMessage", {
    chat_id: chatId,
    text:
      "⚖️ *Berat Badan*\n\n" +
      "Masukkan berat badan pasien dalam kg.\n\n" +
      "Contoh: `55`",
    parse_mode: "Markdown",
  });
}

// =====================================================
// ANAMNESIS
// =====================================================

async function askAnamnesis(chatId: number) {
  const session = sessions.get(chatId);

  if (!session) return;

  session.step = "ukp_anamnesis";

  await telegram("sendMessage", {
    chat_id: chatId,
    text:
      "📝 *Anamnesis*\n\n" +
      "Masukkan anamnesis pasien.",
    parse_mode: "Markdown",
  });
}

// =====================================================
// PEMERIKSAAN FISIK
// =====================================================

async function askPemeriksaan(chatId: number) {
  const session = sessions.get(chatId);

  if (!session) return;

  session.step = "ukp_pemeriksaan";

  await telegram("sendMessage", {
    chat_id: chatId,
    text:
      "🔬 *Pemeriksaan fisik*\n\n" +
      "Masukkan hasil pemeriksaan fisik.",
    parse_mode: "Markdown",
  });
}

// =====================================================
// PEMERIKSAAN PENUNJANG
// =====================================================

async function askPenunjang(chatId: number) {
  const session = sessions.get(chatId);

  if (!session) return;

  session.step = "ukp_penunjang";

  await telegram("sendMessage", {
    chat_id: chatId,
    text:
      "🧪 *Pemeriksaan penunjang*\n\n" +
      "Masukkan hasil pemeriksaan penunjang.\n\n" +
      "Jika tidak ada, ketik `Tidak ada`.",
    parse_mode: "Markdown",
  });
}

// =====================================================
// DIAGNOSIS
// =====================================================

async function askDiagnosis(chatId: number) {
  const session = sessions.get(chatId);

  if (!session) return;

  session.step = "ukp_diagnosis";

  await telegram("sendMessage", {
    chat_id: chatId,
    text:
      "🩺 *Diagnosis*\n\n" +
      "Masukkan diagnosis pasien.",
    parse_mode: "Markdown",
  });
}

// =====================================================
// FARMAKOTERAPI
// =====================================================

async function askFarmakoterapi(chatId: number) {
  const session = sessions.get(chatId);

  if (!session) return;

  session.step = "ukp_farmakoterapi";

  await telegram("sendMessage", {
    chat_id: chatId,
    text:
      "💊 *Farmakoterapi*\n\n" +
      "Masukkan farmakoterapi yang diberikan.\n\n" +
      "Jika tidak ada, ketik `Tidak ada`.",
    parse_mode: "Markdown",
  });
}

// =====================================================
// NON FARMAKOTERAPI
// =====================================================

async function askNonFarmakoterapi(chatId: number) {
  const session = sessions.get(chatId);

  if (!session) return;

  session.step = "ukp_non_farmakoterapi";

  await telegram("sendMessage", {
    chat_id: chatId,
    text:
      "🩹 *Non-farmakoterapi*\n\n" +
      "Masukkan tindakan non-farmakoterapi.\n\n" +
      "Jika tidak ada, ketik `Tidak ada`.",
    parse_mode: "Markdown",
  });
}

// =====================================================
// MONITORING & EVALUASI
// =====================================================

async function askMonitoring(chatId: number) {
  const session = sessions.get(chatId);

  if (!session) return;

  session.step = "ukp_monitoring";

  await telegram("sendMessage", {
    chat_id: chatId,
    text:
      "📊 *Monitoring dan evaluasi*\n\n" +
      "Masukkan monitoring dan evaluasi pasien.",
    parse_mode: "Markdown",
  });
}

// =====================================================
// DIAGNOSIS BANDING
// =====================================================

async function askDiagnosisBanding(chatId: number) {
  const session = sessions.get(chatId);

  if (!session) return;

  session.step = "ukp_diagnosis_banding";

  await telegram("sendMessage", {
    chat_id: chatId,
    text:
      "🔍 *Diagnosis banding*\n\n" +
      "Masukkan diagnosis banding.\n\n" +
      "Jika tidak ada, ketik `Tidak ada`.",
    parse_mode: "Markdown",
  });
}

// =====================================================
// STATUS RUJUKAN
// =====================================================

async function askStatusRujukan(chatId: number) {
  const session = sessions.get(chatId);

  if (!session) return;

  session.step = "ukp_status_rujukan";

  await telegram("sendMessage", {
    chat_id: chatId,
    text:
      "🏥 *Status rujukan*\n\n" +
      "Apakah pasien dirujuk?",
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🏥 Rujuk",
            callback_data: "ukp_rujuk",
          },
          {
            text: "✅ Tidak Rujuk",
            callback_data: "ukp_tidak_rujuk",
          },
        ],
      ],
    },
  });
}

// =====================================================
// TAMPILKAN REVIEW
// =====================================================

async function showUkpReview(chatId: number, messageId?: number) {
  const session = sessions.get(chatId);

  if (!session) return;

  const d = session.data;

  const text =
    "📋 *REVIEW DATA UKP*\n\n" +
    `📅 Tanggal pelayanan: ${d.tanggal || "-"}\n` +
    `🪪 No. RM: ${d.no_rm || "-"}\n` +
    `🩺 Jenis tindakan: ${d.jenis_tindakan || "-"}\n` +
    `📂 Sumber data: ${d.sumber_data || "-"}\n` +
    `👤 Jenis kelamin: ${d.jenis_kelamin || "-"}\n` +
    `👶 Kategori pasien: ${d.kategori_pasien || "-"}\n` +
    `🦠 Kategori kasus: ${d.kategori_kasus || "-"}\n` +
    `🫁 TB: ${d.tb || "-"}\n` +
    `⚖️ BB: ${d.bb || "-"} kg\n\n` +
    `📝 Anamnesis:\n${d.anamnesis || "-"}\n\n` +
    `🔬 Pemeriksaan fisik:\n${d.pemeriksaan || "-"}\n\n` +
    `🧪 Pemeriksaan penunjang:\n${d.penunjang || "-"}\n\n` +
    `🩺 Diagnosis:\n${d.diagnosis || "-"}\n\n` +
    `💊 Farmakoterapi:\n${d.farmakoterapi || "-"}\n\n` +
    `🩹 Non-farmakoterapi:\n${d.non_farmakoterapi || "-"}\n\n` +
    `📊 Monitoring & evaluasi:\n${d.monitoring || "-"}\n\n` +
    `🔍 Diagnosis banding:\n${d.diagnosis_banding || "-"}\n\n` +
    `🏥 Status rujukan: ${d.status_rujukan || "-"}\n\n` +
    "────────────────────\n" +
    "Apakah semua data sudah benar?";

  const payload = {
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "💾 Simpan ke Logbook",
            callback_data: "ukp_save",
          },
        ],
        [
          {
            text: "🔄 Input Ulang",
            callback_data: "ukp_input",
          },
        ],
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
    await telegram("editMessageText", {
      ...payload,
      message_id: messageId,
    });
  } else {
    await telegram("sendMessage", payload);
  }
}

// =====================================================
// HANDLE CALLBACK
// =====================================================

async function handleCallback(update: any) {
  const callback = update.callback_query;

  const callbackId = callback.id;
  const data = callback.data;

  const chatId = callback.message?.chat?.id;
  const messageId = callback.message?.message_id;

  await telegram("answerCallbackQuery", {
    callback_query_id: callbackId,
  });

  if (!chatId || !messageId) {
    return;
  }

  // ===================================================
  // MENU UTAMA
  // ===================================================

  if (data === "menu_start") {
    sessions.delete(chatId);

    await showMainMenu(chatId, messageId);

    return;
  }

  // ===================================================
  // UKP
  // ===================================================

  if (data === "menu_ukp") {
    await showUkpMenu(chatId, messageId);

    return;
  }

  // ===================================================
  // INPUT UKP
  // ===================================================

  if (data === "ukp_input") {
    await startUkp(chatId, messageId);

    return;
  }

  // ===================================================
  // TANGGAL HARI INI
  // ===================================================

  if (data === "ukp_tanggal_hari_ini") {
    const session = sessions.get(chatId);

    if (!session) return;

    session.data.tanggal = getToday();

    await telegram("editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text:
        `📅 *Tanggal pelayanan:* ${session.data.tanggal}\n\n` +
        "Tanggal hari ini dipilih.",
      parse_mode: "Markdown",
    });

    await askNoRm(chatId);

    return;
  }

  // ===================================================
  // TANGGAL MANUAL
  // ===================================================

  if (data === "ukp_tanggal_manual") {
    const session = sessions.get(chatId);

    if (!session) return;

    session.step = "ukp_tanggal_manual";

    await telegram("editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text:
        "📅 *Tanggal pelayanan*\n\n" +
        "Masukkan tanggal pelayanan.\n\n" +
        "Format:\n" +
        "`07/10/2026`",
      parse_mode: "Markdown",
    });

    return;
  }

  // ===================================================
  // JENIS TINDAKAN
  // ===================================================

  const jenisTindakan: Record<string, string> = {
    ukp_jenis_medik: "Medik",
    ukp_jenis_bawah: "Bawah",
    ukp_jenis_kegawatdaruratan: "Kegawatdaruratan",
    ukp_jenis_kejiwaan: "Kejiwaan",
    ukp_jenis_medikolegal: "Medikolegal",
    ukp_jenis_kebidanan: "Kebidanan-Perinatal",
  };

  if (jenisTindakan[data]) {
    const session = sessions.get(chatId);

    if (!session) return;

    session.data.jenis_tindakan = jenisTindakan[data];

    await telegram("sendMessage", {
      chat_id: chatId,
      text: `✅ Jenis tindakan: *${jenisTindakan[data]}*`,
      parse_mode: "Markdown",
    });

    await askSumberData(chatId);

    return;
  }

  // ===================================================
  // SUMBER DATA
  // ===================================================

  const sumberData: Record<string, string> = {
    ukp_sumber_darurat: "Rawat Darurat",
    ukp_sumber_inap: "Rawat Inap",
    ukp_sumber_jalan: "Rawat Jalan",
  };

  if (sumberData[data]) {
    const session = sessions.get(chatId);

    if (!session) return;

    session.data.sumber_data = sumberData[data];

    await telegram("sendMessage", {
      chat_id: chatId,
      text: `✅ Sumber data: *${sumberData[data]}*`,
      parse_mode: "Markdown",
    });

    await askJenisKelamin(chatId);

    return;
  }

  // ===================================================
  // JENIS KELAMIN
  // ===================================================

  const jenisKelamin: Record<string, string> = {
    ukp_kelamin_laki: "Laki-laki",
    ukp_kelamin_perempuan: "Perempuan",
  };

  if (jenisKelamin[data]) {
    const session = sessions.get(chatId);

    if (!session) return;

    session.data.jenis_kelamin = jenisKelamin[data];

    await telegram("sendMessage", {
      chat_id: chatId,
      text: `✅ Jenis kelamin: *${jenisKelamin[data]}*`,
      parse_mode: "Markdown",
    });

    await askKategoriPasien(chatId);

    return;
  }

  // ===================================================
  // KATEGORI PASIEN
  // ===================================================

  const kategoriPasien: Record<string, string> = {
    ukp_pasien_bayi_anak: "Bayi-Anak",
    ukp_pasien_dewasa: "Dewasa",
    ukp_pasien_lansia: "Lansia",
  };

  if (kategoriPasien[data]) {
    const session = sessions.get(chatId);

    if (!session) return;

    session.data.kategori_pasien = kategoriPasien[data];

    await telegram("sendMessage", {
      chat_id: chatId,
      text: `✅ Kategori pasien: *${kategoriPasien[data]}*`,
      parse_mode: "Markdown",
    });

    await askKategoriKasus(chatId);

    return;
  }

  // ===================================================
  // KATEGORI KASUS
  // ===================================================

  const kategoriKasus: Record<string, string> = {
    ukp_kasus_non_covid: "Non-COVID",
    ukp_kasus_suspect: "Suspect",
    ukp_kasus_probable: "Probable",
    ukp_kasus_kontak_erat: "Kontak Erat",
    ukp_kasus_konfirmasi: "Konfirmasi",
  };

  if (kategoriKasus[data]) {
    const session = sessions.get(chatId);

    if (!session) return;

    session.data.kategori_kasus = kategoriKasus[data];

    await telegram("sendMessage", {
      chat_id: chatId,
      text: `✅ Kategori kasus: *${kategoriKasus[data]}*`,
      parse_mode: "Markdown",
    });

    await askTb(chatId);

    return;
  }

  // ===================================================
  // TB
  // ===================================================

  if (data === "ukp_tb_ya" || data === "ukp_tb_tidak") {
    const session = sessions.get(chatId);

    if (!session) return;

    session.data.tb = data === "ukp_tb_ya" ? "Ya" : "Tidak";

    await telegram("sendMessage", {
      chat_id: chatId,
      text: `✅ TB: *${session.data.tb}*`,
      parse_mode: "Markdown",
    });

    await askBb(chatId);

    return;
  }

  // ===================================================
  // STATUS RUJUKAN
  // ===================================================

  if (data === "ukp_rujuk" || data === "ukp_tidak_rujuk") {
    const session = sessions.get(chatId);

    if (!session) return;

    session.data.status_rujukan =
      data === "ukp_rujuk" ? "Rujuk" : "Tidak Rujuk";

    await showUkpReview(chatId);

    session.step = "ukp_konfirmasi";

    return;
  }

  // ===================================================
  // SIMPAN UKP
  // ===================================================

  if (data === "ukp_save") {
    const session = sessions.get(chatId);

    if (!session) {
      await telegram("sendMessage", {
        chat_id: chatId,
        text:
          "⚠️ Data UKP sudah tidak ditemukan.\n\n" +
          "Silakan mulai input UKP dari awal.",
      });

      return;
    }

    console.log("=================================");
    console.log("MENYIMPAN DATA UKP");
    console.log(session.data);
    console.log("=================================");

    await telegram("editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text:
        "✅ *DATA UKP BERHASIL DITERIMA*\n\n" +
        "Data sudah melewati tahap review.\n\n" +
        "📋 Data UKP:\n" +
        `📅 ${session.data.tanggal}\n` +
        `🪪 No. RM: ${session.data.no_rm}\n` +
        `🩺 Jenis tindakan: ${session.data.jenis_tindakan}\n` +
        `📂 Sumber data: ${session.data.sumber_data}\n` +
        `👤 Jenis kelamin: ${session.data.jenis_kelamin}\n` +
        `👶 Kategori pasien: ${session.data.kategori_pasien}\n` +
        `🦠 Kategori kasus: ${session.data.kategori_kasus}\n` +
        `🫁 TB: ${session.data.tb}\n` +
        `⚖️ BB: ${session.data.bb} kg\n\n` +
        "🎉 *Tahap penyimpanan bot berhasil.*\n\n" +
        "Selanjutnya data ini akan kita hubungkan langsung ke Supabase.",
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "➕ Input UKP Baru",
              callback_data: "ukp_input",
            },
          ],
          [
            {
              text: "🏠 Menu Utama",
              callback_data: "menu_start",
            },
          ],
        ],
      },
    });

    // Untuk sementara hapus session setelah berhasil disimpan
    sessions.delete(chatId);

    return;
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

    return;
  }

  // ===================================================
  // UKM CATEGORY
  // ===================================================

  const ukmCategories: Record<string, string> = {
    ukm_kesling: "🏠 Kesehatan Lingkungan (Kesling)",
    ukm_promkes: "📢 Promosi Kesehatan (Promkes)",
    ukm_keluarga: "👨‍👩‍👧 Kesehatan Keluarga",
    ukm_gizi: "🍎 Pelayanan Gizi",
    ukm_p2p: "🦠 Pencegahan dan Pengendalian Penyakit (P2P)",
  };

  if (ukmCategories[data]) {
    await telegram("editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text:
        `*${ukmCategories[data]}*\n\n` +
        "Alur UKM akan kita buat setelah alur UKP selesai.",
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "⬅️ Kembali",
              callback_data: "menu_ukm",
            },
          ],
        ],
      },
    });

    return;
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
        "Fitur ini akan kita buat setelah UKP selesai.",
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

    return;
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

    return;
  }
}

// =====================================================
// HANDLE MESSAGE
// =====================================================

async function handleMessage(update: any) {
  const message = update.message;

  if (!message?.chat?.id) {
    return;
  }

  const chatId = message.chat.id;
  const text = message.text?.trim() || "";

  // ===================================================
  // /START
  // ===================================================

  if (text === "/start") {
    sessions.delete(chatId);

    await showMainMenu(chatId);

    return;
  }

  const session = sessions.get(chatId);

  if (!session) {
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

    return;
  }

  // ===================================================
  // TANGGAL MANUAL
  // ===================================================

  if (session.step === "ukp_tanggal_manual") {
    session.data.tanggal = text;

    await telegram("sendMessage", {
      chat_id: chatId,
      text:
        `✅ Tanggal pelayanan: *${text}*\n\n` +
        "🪪 *Nomor Rekam Medis*\n\n" +
        "Masukkan No. RM pasien.",
      parse_mode: "Markdown",
    });

    session.step = "ukp_no_rm";

    return;
  }

  // ===================================================
  // NO RM
  // ===================================================

  if (session.step === "ukp_no_rm") {
    session.data.no_rm = text;

    await telegram("sendMessage", {
      chat_id: chatId,
      text:
        `✅ No. RM: *${text}*`,
      parse_mode: "Markdown",
    });

    await askJenisTindakan(chatId);

    return;
  }

  // ===================================================
  // BB
  // ===================================================

  if (session.step === "ukp_bb") {
    session.data.bb = text;

    await telegram("sendMessage", {
      chat_id: chatId,
      text:
        `✅ Berat badan: *${text} kg*`,
      parse_mode: "Markdown",
    });

    await askAnamnesis(chatId);

    return;
  }

  // ===================================================
  // ANAMNESIS
  // ===================================================

  if (session.step === "ukp_anamnesis") {
    session.data.anamnesis = text;

    await telegram("sendMessage", {
      chat_id: chatId,
      text: "✅ Anamnesis dicatat.",
    });

    await askPemeriksaan(chatId);

    return;
  }

  // ===================================================
  // PEMERIKSAAN FISIK
  // ===================================================

  if (session.step === "ukp_pemeriksaan") {
    session.data.pemeriksaan = text;

    await telegram("sendMessage", {
      chat_id: chatId,
      text: "✅ Pemeriksaan fisik dicatat.",
    });

    await askPenunjang(chatId);

    return;
  }

  // ===================================================
  // PENUNJANG
  // ===================================================

  if (session.step === "ukp_penunjang") {
    session.data.penunjang = text;

    await telegram("sendMessage", {
      chat_id: chatId,
      text: "✅ Pemeriksaan penunjang dicatat.",
    });

    await askDiagnosis(chatId);

    return;
  }

  // ===================================================
  // DIAGNOSIS
  // ===================================================

  if (session.step === "ukp_diagnosis") {
    session.data.diagnosis = text;

    await telegram("sendMessage", {
      chat_id: chatId,
      text: "✅ Diagnosis dicatat.",
    });

    await askFarmakoterapi(chatId);

    return;
  }

  // ===================================================
  // FARMAKOTERAPI
  // ===================================================

  if (session.step === "ukp_farmakoterapi") {
    session.data.farmakoterapi = text;

    await telegram("sendMessage", {
      chat_id: chatId,
      text: "✅ Farmakoterapi dicatat.",
    });

    await askNonFarmakoterapi(chatId);

    return;
  }

  // ===================================================
  // NON FARMAKOTERAPI
  // ===================================================

  if (session.step === "ukp_non_farmakoterapi") {
    session.data.non_farmakoterapi = text;

    await telegram("sendMessage", {
      chat_id: chatId,
      text: "✅ Non-farmakoterapi dicatat.",
    });

    await askMonitoring(chatId);

    return;
  }

  // ===================================================
  // MONITORING
  // ===================================================

  if (session.step === "ukp_monitoring") {
    session.data.monitoring = text;

    await telegram("sendMessage", {
      chat_id: chatId,
      text: "✅ Monitoring dan evaluasi dicatat.",
    });

    await askDiagnosisBanding(chatId);

    return;
  }

  // ===================================================
  // DIAGNOSIS BANDING
  // ===================================================

  if (session.step === "ukp_diagnosis_banding") {
    session.data.diagnosis_banding = text;

    await telegram("sendMessage", {
      chat_id: chatId,
      text: "✅ Diagnosis banding dicatat.",
    });

    await askStatusRujukan(chatId);

    return;
  }

  // ===================================================
  // FALLBACK SESSION
  // ===================================================

  sessions.delete(chatId);

  await telegram("sendMessage", {
    chat_id: chatId,
    text:
      "⚠️ Sesi input tidak dikenali.\n\n" +
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
}

// =====================================================
// POST WEBHOOK
// =====================================================

export async function POST(request: Request) {
  try {
    const update = await request.json();

    console.log("=================================");
    console.log("TELEGRAM UPDATE");
    console.log(JSON.stringify(update, null, 2));
    console.log("=================================");

    // Callback dari tombol
    if (update.callback_query) {
      await handleCallback(update);

      return NextResponse.json({
        ok: true,
      });
    }

    // Pesan biasa
    if (update.message) {
      await handleMessage(update);

      return NextResponse.json({
        ok: true,
      });
    }

    return NextResponse.json({
      ok: true,
    });
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