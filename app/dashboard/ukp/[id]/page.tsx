
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPE
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

    setData(entry as UkpEntry);
    setLoading(false);
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f7fb] px-5 py-10">
        <div className="mx-auto flex min-h-[60vh] max-w-5xl flex-col items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50">
            <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-teal-100 border-t-teal-600" />
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-700">
            Memuat detail UKP
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Mohon tunggu sebentar...
          </p>
        </div>
      </main>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#f5f7fb] px-5 py-10">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => router.push("/dashboard")}
            className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-teal-200 hover:text-teal-700"
          >
            <span>←</span>
            Kembali ke Dashboard
          </button>

          <div className="rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-600">
              !
            </div>
            <h1 className="mt-5 text-xl font-bold text-slate-900">
              Data tidak dapat ditampilkan
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error || "Data UKP tidak ditemukan."}
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">

        {/* BREADCRUMB */}

        <div className="mb-7 flex flex-wrap items-center gap-2 text-sm">
          <button
            onClick={() => router.push("/dashboard")}
            className="font-medium text-slate-400 transition hover:text-teal-700"
          >
            Dashboard
          </button>
          <span className="text-slate-300">/</span>
          <span className="font-medium text-slate-400">Logbook</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-700">Detail UKP</span>
        </div>

        {/* HEADER */}

        <section className="relative mb-7 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#102b35] via-[#153f49] to-[#116b69] p-6 text-white shadow-[0_18px_45px_-20px_rgba(15,70,75,0.5)] sm:p-9">
          <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 -top-10 h-48 w-48 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 right-36 h-56 w-56 rounded-full bg-teal-300/10 blur-3xl" />

          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-teal-200/20 bg-teal-100/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-100">
                Logbook Internsip
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-semibold tracking-wide text-white/75">
                UPAYA KESEHATAN PERSEORANGAN
              </span>
            </div>

            <div className="mt-7 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Detail UKP
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                  Ringkasan informasi pelayanan, data pasien, dan dokumentasi
                  klinis dalam satu tampilan.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-3.5 backdrop-blur-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-300/15 text-lg font-bold text-teal-200">
                  UKP
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-300">
                    Tanggal pelayanan
                  </p>
                  <p className="mt-1 text-sm font-bold text-white">
                    {formatDate(data.tanggal_pelayanan)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* IDENTITAS PASIEN */}

        <section className="mb-6 rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.12)] sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-teal-50 to-cyan-100 text-xl font-bold text-teal-800 ring-1 ring-teal-100">
                {data.inisial_pasien?.trim()
                  ? data.inisial_pasien.trim().slice(0, 2).toUpperCase()
                  : "—"}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Identitas pasien
                </p>
                <h2 className="mt-1 break-words text-xl font-bold tracking-tight text-slate-900">
                  {displayValue(data.inisial_pasien)}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  No. RM: {displayValue(data.no_rm)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:justify-end">
              <StatusPill value={data.kategori_pasien} />
              <StatusPill value={data.kategori_kasus} />
            </div>
          </div>

          <div className="my-6 h-px bg-slate-100" />

          <div className="grid grid-cols-2 gap-x-5 gap-y-6 lg:grid-cols-4">
            <Metric
              label="Jenis kelamin"
              value={data.jenis_kelamin}
              icon="◉"
            />
            <Metric
              label="Berat badan"
              value={formatMeasurement(data.bb, "kg")}
              icon="↕"
            />
            <Metric
              label="Tinggi badan"
              value={formatMeasurement(data.tb, "cm")}
              icon="↕"
            />
            <Metric
              label="Status rujukan"
              value={data.status_rujukan}
              icon="↗"
            />
          </div>
        </section>

        {/* INFORMASI PELAYANAN */}

        <SectionCard
          number="01"
          eyebrow="DATA ADMINISTRATIF"
          title="Informasi Pelayanan"
          description="Informasi dasar mengenai kunjungan dan jenis pelayanan."
          icon="▤"
        >
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Tanggal pelayanan"
              value={formatDate(data.tanggal_pelayanan)}
            />
            <Field label="No. rekam medis" value={data.no_rm} />
            <Field label="Inisial pasien" value={data.inisial_pasien} />
            <Field label="Jenis tindakan" value={data.jenis_tindakan} />
            <Field label="Sumber data" value={data.sumber_data} />
            <Field label="Jenis kelamin" value={data.jenis_kelamin} />
            <Field label="Kategori pasien" value={data.kategori_pasien} />
            <Field label="Kategori kasus" value={data.kategori_kasus} />
            <Field
              label="Status rujukan"
              value={data.status_rujukan}
            />
          </div>
        </SectionCard>

        {/* DATA KLINIS */}

        <SectionCard
          number="02"
          eyebrow="DOKUMENTASI KLINIS"
          title="Data Klinis"
          description="Anamnesis, hasil pemeriksaan, diagnosis, dan rencana tata laksana."
          icon="✚"
        >
          <div className="space-y-7">
            <LongField
              label="Anamnesis"
              value={data.anamnesis}
              number="01"
            />
            <LongField
              label="Pemeriksaan fisik"
              value={data.pemeriksaan_fisik}
              number="02"
            />
            <LongField
              label="Pemeriksaan penunjang"
              value={data.pemeriksaan_penunjang}
              number="03"
            />

            <div className="grid gap-5 lg:grid-cols-2">
              <LongField
                label="Diagnosis"
                value={data.diagnosis}
                number="04"
                accent
              />
              <LongField
                label="Diagnosis banding"
                value={data.diagnosis_banding}
                number="05"
              />
            </div>

            <div className="h-px bg-slate-100" />

            <div className="grid gap-7 lg:grid-cols-2">
              <LongField
                label="Farmakoterapi"
                value={data.farmakoterapi}
                number="06"
              />
              <LongField
                label="Non-farmakoterapi"
                value={data.non_farmakoterapi}
                number="07"
              />
            </div>

            <LongField
              label="Monitoring & evaluasi"
              value={data.monitoring_evaluasi}
              number="08"
            />
          </div>
        </SectionCard>

        {/* INFORMASI SISTEM */}

        <SectionCard
          number="03"
          eyebrow="METADATA"
          title="Informasi Sistem"
          description="Informasi identifikasi dan riwayat pembaruan data."
          icon="⌘"
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="ID data" value={data.id} mono />
            <Field
              label="Dibuat pada"
              value={formatDateTime(data.created_at)}
            />
            <Field
              label="Terakhir diperbarui"
              value={formatDateTime(data.updated_at)}
            />
          </div>
        </SectionCard>

        {/* ACTION */}

        <section className="mt-7 rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.12)] sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Perlu melakukan perubahan?
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Buka halaman edit untuk memperbarui data UKP ini.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <span>←</span>
                Dashboard
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(`/dashboard/ukp/${data.id}/edit`)
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(13,148,136,0.7)] transition hover:-translate-y-0.5 hover:from-teal-800 hover:to-teal-700 hover:shadow-lg"
              >
                <span>✎</span>
                Edit Data UKP
                <span>→</span>
              </button>
            </div>
          </div>
        </section>

        <footer className="pb-5 pt-8 text-center">
          <p className="text-xs font-medium tracking-wide text-slate-400">
            LOGBOOK INTERNSIP · UPAYA KESEHATAN PERSEORANGAN
          </p>
        </footer>
      </div>
    </main>
  );
}

/* =========================================================
   SECTION CARD
========================================================= */

function SectionCard({
  number,
  eyebrow,
  title,
  description,
  icon,
  children,
}: {
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6 rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.12)] sm:p-7">
      <div className="mb-7 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-xl font-semibold text-teal-700 ring-1 ring-teal-100/80">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-teal-700">
              {eyebrow}
            </p>
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
              {number}
            </span>
          </div>

          <h2 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {title}
          </h2>
          <p className="mt-1.5 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   METRIC
========================================================= */

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number | null | undefined;
  icon: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-sm font-bold text-teal-700 ring-1 ring-slate-100">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="mt-1 break-words text-sm font-bold text-slate-800">
          {displayValue(value)}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   STATUS PILL
========================================================= */

function StatusPill({
  value,
}: {
  value: string | null | undefined;
}) {
  const text = displayValue(value);

  return (
    <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
      <span className="break-words">{text}</span>
    </span>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | number | null | undefined;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0 border-b border-slate-100 pb-4 last:border-b-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
        {label}
      </p>
      <p
        className={`mt-2 break-words text-sm font-semibold leading-6 text-slate-800 ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {displayValue(value)}
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
  number,
  accent = false,
}: {
  label: string;
  value: string | null | undefined;
  number: string;
  accent?: boolean;
}) {
  const content = displayValue(value);

  return (
    <div className="min-w-0">
      <div className="mb-2.5 flex items-center gap-2.5">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
            accent
              ? "bg-teal-100 text-teal-800"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {number}
        </span>
        <h3 className="text-sm font-bold text-slate-700">{label}</h3>
      </div>

      <div
        className={`min-h-[76px] overflow-hidden rounded-2xl border p-4 text-sm leading-7 ${
          accent
            ? "border-teal-100 bg-teal-50/60 text-slate-800"
            : "border-slate-100 bg-[#f8fafc] text-slate-700"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{content}</p>
      </div>
    </div>
  );
}

/* =========================================================
   DISPLAY VALUE
========================================================= */

function displayValue(
  value: string | number | null | undefined
): string {
  if (value === null || value === undefined) return "-";

  const text = String(value).trim();
  return text !== "" ? text : "-";
}

/* =========================================================
   MEASUREMENT
========================================================= */

function formatMeasurement(
  value: number | null | undefined,
  unit: string
) {
  if (value === null || value === undefined || value === 0) {
    return "-";
  }

  return `${value} ${unit}`;
}

/* =========================================================
   DATE
========================================================= */

function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  // Tanggal pelayanan umumnya berupa YYYY-MM-DD.
  // Hindari pergeseran hari akibat konversi UTC.
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (dateOnly) {
    const [, year, month, day] = dateOnly;

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    ).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/* =========================================================
   DATETIME
========================================================= */

function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
