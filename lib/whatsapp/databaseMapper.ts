import {
  ParsedWhatsAppMessage,
} from "./parser";

function getField(
  fields: Record<string, string>,
  ...keys: string[]
) {
  for (const key of keys) {
    if (fields[key] !== undefined) {
      return fields[key];
    }
  }

  return "";
}

function toNumber(
  value: string
) {
  if (!value) return null;

  const cleaned =
    value
      .replace(",", ".")
      .replace(/[^\d.]/g, "");

  const number =
    Number(cleaned);

  return Number.isFinite(number)
    ? number
    : null;
}


/* =========================================================
   UKP
========================================================= */

function mapUKP(
  parsed: ParsedWhatsAppMessage,
  userId: string
) {
  const { fields, rawInput } =
    parsed;

  return {
    user_id: userId,

    jenis_tindakan: getField(
      fields,
      "jenis_tindakan",
      "jenis_tindakan_medis",
      "tindakan"
    ),

    no_rekam_medis: getField(
      fields,
      "rm",
      "no_rekam_medis",
      "nomor_rekam_medis"
    ),

    sumber_data: getField(
      fields,
      "sumber_data",
      "sumber"
    ),

    tanggal_pelayanan: getField(
      fields,
      "tanggal",
      "tanggal_pelayanan",
      "tgl"
    ),

    inisial_pasien: getField(
      fields,
      "inisial",
      "inisial_pasien"
    ),

    jenis_kelamin: getField(
      fields,
      "jk",
      "jenis_kelamin",
      "jenis_kelamin_pasien"
    ),

    kategori_pasien: getField(
      fields,
      "kategori_pasien",
      "kategori"
    ),

    kategori_kasus: getField(
      fields,
      "kategori_kasus",
      "kasus"
    ),

    berat_badan: toNumber(
      getField(
        fields,
        "bb",
        "berat_badan"
      )
    ),

    tinggi_badan: toNumber(
      getField(
        fields,
        "tb",
        "tinggi_badan"
      )
    ),

    anamnesis: getField(
      fields,
      "anamnesis",
      "keluhan"
    ),

    pemeriksaan_fisik: getField(
      fields,
      "pf",
      "pemeriksaan_fisik",
      "pemeriksaan"
    ),

    pemeriksaan_penunjang:
      getField(
        fields,
        "pp",
        "pemeriksaan_penunjang",
        "penunjang"
      ),

    diagnosis_text: getField(
      fields,
      "diagnosis",
      "dx"
    ),

    farmakoterapi: getField(
      fields,
      "terapi",
      "farmakoterapi",
      "obat"
    ),

    non_farmakoterapi:
      getField(
        fields,
        "non_farmakoterapi",
        "non_farmako",
        "edukasi"
      ),

    monitoring_evaluasi:
      getField(
        fields,
        "monitoring_evaluasi",
        "monitoring",
        "evaluasi"
      ),

    diagnosis_banding_text:
      getField(
        fields,
        "diagnosis_banding",
        "dd",
        "diagnosis_banding_text"
      ),

    status_rujukan: getField(
      fields,
      "status_rujukan",
      "rujukan"
    ),

    telegram_raw_input:
      rawInput,

    status: "needs_review",
  };
}


/* =========================================================
   UKM
========================================================= */

function mapUKM(
  parsed: ParsedWhatsAppMessage,
  userId: string
) {
  const { fields, rawInput } =
    parsed;

  const program =
    getField(
      fields,
      "bidang",
      "program",
      "ukm"
    );

  return {
    user_id: userId,

    program,

    tipe_kegiatan:
      getField(
        fields,
        "jenis_kegiatan",
        "tipe_kegiatan",
        "kegiatan"
      ),

    tanggal_pelayanan:
      getField(
        fields,
        "tanggal",
        "tanggal_pelayanan",
        "tgl"
      ),

    judul_laporan:
      getField(
        fields,
        "judul",
        "judul_laporan",
        "judul_kegiatan"
      ),

    latar_belakang:
      getField(
        fields,
        "latar_belakang",
        "latar"
      ),

    gambaran_pelaksanaan:
      getField(
        fields,
        "gambaran_pelaksanaan",
        "pelaksanaan",
        "gambaran"
      ),

    mempunyai_jamban_keluarga:
      getBoolean(
        getField(
          fields,
          "jamban",
          "mempunyai_jamban_keluarga"
        )
      ),

    mempunyai_tempat_pembuangan_sampah:
      getBoolean(
        getField(
          fields,
          "tempat_sampah",
          "sampah",
          "mempunyai_tempat_pembuangan_sampah"
        )
      ),

    tidak_merokok:
      getBoolean(
        getField(
          fields,
          "tidak_merokok",
          "merokok"
        )
      ),

    mempunyai_air_bersih:
      getBoolean(
        getField(
          fields,
          "air_bersih",
          "air"
        )
      ),

    telegram_raw_input:
      rawInput,

    status: "needs_review",
  };
}


/* =========================================================
   TINDAKAN MEDIS
========================================================= */

function mapTM(
  parsed: ParsedWhatsAppMessage,
  userId: string
) {
  const { fields, rawInput } =
    parsed;

  return {
    user_id: userId,

    sumber_data: getField(
      fields,
      "sumber_data",
      "sumber"
    ),

    no_rekam_medis: getField(
      fields,
      "rm",
      "no_rekam_medis",
      "nomor_rekam_medis"
    ),

    inisial_pasien: getField(
      fields,
      "inisial",
      "inisial_pasien"
    ),

    jenis_kelamin: getField(
      fields,
      "jk",
      "jenis_kelamin"
    ),

    berat_badan: toNumber(
      getField(
        fields,
        "bb",
        "berat_badan"
      )
    ),

    tinggi_badan: toNumber(
      getField(
        fields,
        "tb",
        "tinggi_badan"
      )
    ),

    tanggal_pelayanan:
      getField(
        fields,
        "tanggal",
        "tanggal_pelayanan",
        "tgl"
      ),

    nama_dpjp: getField(
      fields,
      "dpjp",
      "nama_dpjp",
      "dokter"
    ),

    anamnesis: getField(
      fields,
      "anamnesis",
      "keluhan"
    ),

    diagnosis_text: getField(
      fields,
      "diagnosis",
      "dx"
    ),

    tindakan_medis:
      getField(
        fields,
        "tindakan",
        "tindakan_medis"
      ),

    standar_prosedur_operasional:
      getField(
        fields,
        "spo",
        "standar_prosedur_operasional"
      ),

    status: "needs_review",
  };
}


/* =========================================================
   BOOLEAN
========================================================= */

function getBoolean(
  value: string
) {
  const normalized =
    value
      .trim()
      .toLowerCase();

  if (
    ["ya", "yes", "y", "true", "1", "✓"]
      .includes(normalized)
  ) {
    return true;
  }

  if (
    ["tidak", "no", "n", "false", "0", "x"]
      .includes(normalized)
  ) {
    return false;
  }

  return null;
}


/* =========================================================
   EXPORT
========================================================= */

export function mapWhatsAppToDatabase(
  parsed: ParsedWhatsAppMessage,
  userId: string
) {
  if (parsed.type === "UKP") {
    return {
      table: "ukp_entries" as const,
      data: mapUKP(
        parsed,
        userId
      ),
    };
  }

  if (parsed.type === "UKM") {
    return {
      table: "ukm_entries" as const,
      data: mapUKM(
        parsed,
        userId
      ),
    };
  }

  if (parsed.type === "TM") {
    return {
      table: "tm_entries" as const,
      data: mapTM(
        parsed,
        userId
      ),
    };
  }

  return null;
}