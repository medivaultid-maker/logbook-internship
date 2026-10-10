
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  console.log("[KEMENKES DRAFT] ROUTE TERPANGGIL");

  try {
    const entry = await request.json();

    console.log("[KEMENKES DRAFT] ENTRY DITERIMA");

    const token = process.env.KEMENKES_ACCESS_TOKEN;

    if (!token) {
      console.error("[KEMENKES DRAFT] TOKEN TIDAK ADA");

      return NextResponse.json(
        {
          success: false,
          message: "KEMENKES_ACCESS_TOKEN belum diatur.",
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
      periksa_penunjang: entry.pemeriksaan_penunjang,
      tata_laksana_farm: entry.farmakoterapi,
      tata_laksana_non_farm: entry.non_farmakoterapi,
      monitoring: entry.monitoring_evaluasi,
      rujukan:
        entry.status_rujukan === true ||
        entry.status_rujukan === "true",
      special_cat: entry.kategori_kasus,
      is_submit: false,
    };


console.log("[KEMENKES DRAFT] NILAI DROPDOWN:", {
  jenis_tindakan: entry.jenis_tindakan,
  kategori_pasien: entry.kategori_pasien,
  kategori_kasus: entry.kategori_kasus,
});

console.log("[KEMENKES DRAFT] PAYLOAD:", payload);

    console.log("[KEMENKES DRAFT] MULAI FETCH API");

    const response = await fetch(
      "https://api-internsip-logbook.kemkes.go.id/api/participant/borang/pidi/ukp/create",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const text = await response.text();

    let result: any;

    try {
      result = JSON.parse(text);
    } catch {
      result = { raw: text };
    }

    console.log("[KEMENKES DRAFT] STATUS:", response.status);
    console.log("[KEMENKES DRAFT] RESPONSE:", result);

    console.log("[KEMENKES DRAFT] DROPDOWN DIKIRIM:", {
  kode_kegiatan: payload.kode_kegiatan,
  patient_cat: payload.patient_cat,
  special_cat: payload.special_cat,
});

console.log("[KEMENKES DRAFT] HASIL API:", {
  httpStatus: response.status,
  body: result,
});

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
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Respons sukses diterima dari API Kemenkes.",
      data: result,
    });
  } catch (error) {
    console.error("[KEMENKES DRAFT] ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat mengirim data.",
      },
      { status: 500 }
    );
  }
}