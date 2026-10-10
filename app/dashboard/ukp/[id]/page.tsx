"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPE SESUAI TABEL ukp
========================================================= */

type UkpEntry = {
  id: string;

  tanggal_pelayanan: string;
  no_rm: string;
  jenis_tindakan: string;
  sumber_data: string;

  jenis_kelamin: string;
  kategori_pasien: string;
  kategori_kasus: string;

  tb: number;
  bb: number;

  inisial_pasien: string;

  anamnesis: string;
  pemeriksaan_fisik: string;
  pemeriksaan_penunjang: string;

  diagnosis: string;
  diagnosis_banding: string;

  farmakoterapi: string;
  non_farmakoterapi: string;
  monitoring_evaluasi: string;

  status_rujukan: string;

  created_at: string;
  updated_at: string;
};

/* =========================================================
   PAGE
========================================================= */

export default function UkpDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [data, setData] = useState<UkpEntry | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    if (!id) return;

    loadData();
  }, [id]);

  async function loadData() {
    setLoading(true);
    setError("");

    const { data: entry, error } = await supabase
      .from("ukp")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Gagal mengambil data UKP:", error);

      setError(error.message);
      setLoading(false);

      return;
    }

    setData(entry);

    setLoading(false);
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-10">
        <div className="mx-auto max-w-4xl text-center text-slate-500">
          Memuat data UKP...
        </div>
      </main>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error || !data) {
    return (
      <main className="min-h-screen bg-slate-50 p-10">
        <div className="mx-auto max-w-4xl">

          <button
            onClick={() => router.push("/dashboard")}
            className="mb-6 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            ← Kembali ke Dashboard
          </button>

          <div className="rounded-2xl bg-white p-8 text-red-600 ring-1 ring-slate-200">
            {error || "Data UKP tidak ditemukan."}
          </div>

        </div>
      </main>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-4xl px-6 py-10">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">

          <button
            onClick={() => router.push("/dashboard")}
            className="mb-5 text-sm font-semibold text-slate-500 hover:text-slate-900"
          >
            ← Kembali ke Dashboard
          </button>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm font-semibold text-teal-600">
                LOGBOOK INTERNSIP
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Detail UKP
              </h1>

              <p className="mt-2 text-slate-500">
                Detail data Upaya Kesehatan Perseorangan
              </p>

            </div>

          </div>

        </div>


        {/* =================================================
            INFORMASI DATA
        ================================================= */}

        <section className="mb-6 rounded-2xl bg-white p-6 ring-1 ring-slate-200">

          <h2 className="text-lg font-bold text-slate-900">
            Informasi Data
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">

            <Field
              label="Tanggal pelayanan"
              value={formatDate(data.tanggal_pelayanan)}
            />

            <Field
              label="No. Rekam Medis"
              value={data.no_rm}
            />

            <Field
              label="Inisial pasien"
              value={data.inisial_pasien}
            />

            <Field
              label="Jenis tindakan"
              value={data.jenis_tindakan}
            />

            <Field
              label="Sumber data"
              value={data.sumber_data}
            />

            <Field
              label="Jenis kelamin"
              value={data.jenis_kelamin}
            />

            <Field
              label="Kategori pasien"
              value={data.kategori_pasien}
            />

            <Field
              label="Kategori kasus"
              value={data.kategori_kasus}
            />

            <Field
              label="Berat badan"
              value={`${data.bb} kg`}
            />

            <Field
              label="Tinggi badan"
              value={`${data.tb} cm`}
            />

            <Field
              label="Status rujukan"
              value={data.status_rujukan}
            />

          </div>

        </section>


        {/* =================================================
            DATA KLINIS
        ================================================= */}

        <section className="mb-6 rounded-2xl bg-white p-6 ring-1 ring-slate-200">

          <h2 className="text-lg font-bold text-slate-900">
            Data Klinis
          </h2>

          <div className="mt-5 space-y-5">

            <LongField
              label="Anamnesis"
              value={data.anamnesis}
            />

            <LongField
              label="Pemeriksaan fisik"
              value={data.pemeriksaan_fisik}
            />

            <LongField
              label="Pemeriksaan penunjang"
              value={data.pemeriksaan_penunjang}
            />

            <LongField
              label="Diagnosis"
              value={data.diagnosis}
            />

            <LongField
              label="Diagnosis banding"
              value={data.diagnosis_banding}
            />

            <LongField
              label="Farmakoterapi"
              value={data.farmakoterapi}
            />

            <LongField
              label="Non-farmakoterapi"
              value={data.non_farmakoterapi}
            />

            <LongField
              label="Monitoring & evaluasi"
              value={data.monitoring_evaluasi}
            />

          </div>

        </section>


        {/* =================================================
            METADATA
        ================================================= */}

        <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">

          <h2 className="text-lg font-bold text-slate-900">
            Informasi Sistem
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">

            <Field
              label="ID Data"
              value={data.id}
            />

            <Field
              label="Dibuat"
              value={formatDateTime(data.created_at)}
            />

            <Field
              label="Terakhir diperbarui"
              value={formatDateTime(data.updated_at)}
            />

          </div>

        </section>


        {/* =================================================
            ACTION
        ================================================= */}

        <section className="mt-6">

          <button
            type="button"
            onClick={() =>
              router.push(
                `/dashboard/ukp/${data.id}/edit`
              )
            }
            className="w-full rounded-2xl bg-slate-900 px-6 py-4 font-semibold text-white transition hover:bg-slate-800"
          >
            ✏️ Edit Data UKP
          </button>

        </section>

      </div>

    </main>
  );
}


/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div>

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-slate-900">
        {value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
          ? value
          : "-"}
      </p>

    </div>
  );
}


/* =========================================================
   LONG FIELD
========================================================= */

function LongField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="mt-2 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-900 whitespace-pre-wrap">
        {value &&
        value.trim() !== ""
          ? value
          : "-"}
      </div>

    </div>
  );
}


/* =========================================================
   DATE
========================================================= */

function formatDate(
  value: string | null | undefined
) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}


/* =========================================================
   DATETIME
========================================================= */

function formatDateTime(
  value: string | null | undefined
) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}