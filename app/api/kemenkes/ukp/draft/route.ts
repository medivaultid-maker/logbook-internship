import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const entry = await request.json();

    const token = process.env.KEMENKES_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message:
            "KEMENKES_ACCESS_TOKEN belum diatur.",
        },
        { status: 500 }
      );
    }

    const payload = {
      kode_kegiatan: entry.jenis_tindakan,

      no_rekam_medis: entry.no_rm,

      sumber_data: entry.sumber_data,

      pelayanan_date: entry.tanggal_pelayanan,

      patient_cat: entry.kategori_pasien,

      patient_gender: entry.jenis_kelamin,

      patient_height: entry.tb,

      patient_weight: entry.bb,

      patient_initial: entry.inisial_pasien,

      anamnesis: entry.anamnesis,

      periksa_fisik: entry.pemeriksaan_fisik,

      periksa_penunjang:
        entry.pemeriksaan_penunjang,

      diagnosis: entry.diagnosis
        ? [entry.diagnosis]
        : [],

      diagnosis_banding:
        entry.diagnosis_banding
          ? [entry.diagnosis_banding]
          : [],

      tata_laksana_farm:
        entry.farmakoterapi,

      tata_laksana_non_farm:
        entry.non_farmakoterapi,

      monitoring:
        entry.monitoring_evaluasi,

      rujukan:
        entry.status_rujukan === true ||
        entry.status_rujukan === "true",

      special_cat:
        entry.kategori_kasus,

      /*
       * PENTING:
       * false = simpan sebagai draft
       */
      is_submit: false,
    };

    console.log(
      "KEMENKES PAYLOAD:",
      payload
    );

    const response = await fetch(
      "https://api-internsip-logbook.kemkes.go.id/api/participant/borang/pidi/ukp/create",
      {
        method: "POST",

        headers: {
          Accept: "application/json",

          "Content-Type":
            "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(payload),
      }
    );

    const text = await response.text();

    let result;

    try {
      result = JSON.parse(text);
    } catch {
      result = {
        raw: text,
      };
    }

    console.log(
      "KEMENKES STATUS:",
      response.status
    );

    console.log(
      "KEMENKES RESPONSE:",
      result
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,

          message:
            result?.message ||
            result?.error ||
            `Kemenkes mengembalikan status ${response.status}`,

          status: response.status,

          data: result,
        },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json({
      success: true,

      message:
        "Data berhasil dikirim sebagai draft Kemenkes.",

      data: result,
    });

  } catch (error) {

    console.error(
      "KEMENKES DRAFT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat mengirim data.",
      },
      {
        status: 500,
      }
    );
  }
}