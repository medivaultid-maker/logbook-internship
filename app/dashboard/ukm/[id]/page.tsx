"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type UkmEntry = {
  id: string;
  user_id: string | null;

  program: string;
  tipe_kegiatan: string | null;
  tanggal_pelayanan: string;

  judul_laporan: string | null;
  latar_belakang: string | null;
  gambaran_pelaksanaan: string | null;

  mempunyai_jamban_keluarga: boolean | null;
  mempunyai_tempat_pembuangan_sampah: boolean | null;
  tidak_merokok: boolean | null;
  mempunyai_air_bersih: boolean | null;

  status: string;
  telegram_raw_input: string | null;
  prasyarat_binaan: string[] | null;
};

export default function UkmDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [data, setData] =
    useState<UkmEntry | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadData();
  }, [id]);

  /* =========================================================
     LOAD DATA
  ========================================================= */

  async function loadData() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError(
        "Sesi login tidak ditemukan."
      );

      setLoading(false);
      return;
    }

    const { data: entry, error } =
      await supabase
        .from("ukm_entries")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (error) {
      setError(error.message);
    } else {
      setData(entry);
    }

    setLoading(false);
  }

  /* =========================================================
     CEK FIELD WAJIB
  ========================================================= */

  function getMissingFields(data: UkmEntry) {
    const requiredFields = [
      {
        label: "Bidang UKM",
        value: data.program,
      },
      {
        label: "Jenis kegiatan",
        value: data.tipe_kegiatan,
      },
      {
        label: "Tanggal pelayanan",
        value: data.tanggal_pelayanan,
      },
      {
        label: "Judul laporan kegiatan",
        value: data.judul_laporan,
      },
      {
        label: "Latar belakang",
        value: data.latar_belakang,
      },
      {
        label: "Gambaran pelaksanaan",
        value: data.gambaran_pelaksanaan,
      },
    ];

    const missing = requiredFields
      .filter(
        (field) =>
          field.value === null ||
          field.value === undefined ||
          String(field.value).trim() === ""
      )
      .map((field) => field.label);

    /* =====================================================
       KHUSUS KESLING
       
       Boolean:
       false = tetap sudah diisi
       null  = belum diisi
    ===================================================== */

    if (data.program === "Kesling") {
      if (
        data.mempunyai_jamban_keluarga === null
      ) {
        missing.push(
          "Mempunyai jamban keluarga"
        );
      }

      if (
        data.mempunyai_tempat_pembuangan_sampah ===
        null
      ) {
        missing.push(
          "Mempunyai tempat pembuangan sampah"
        );
      }

      if (data.tidak_merokok === null) {
        missing.push("Tidak merokok");
      }

      if (data.mempunyai_air_bersih === null) {
        missing.push(
          "Mempunyai air bersih"
        );
      }
    }

    return missing;
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-10">
        <div className="mx-auto max-w-4xl text-center text-slate-500">
          Memuat data...
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
            onClick={() =>
              router.push("/dashboard")
            }
            className="mb-6 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            ← Kembali ke Dashboard
          </button>

          <div className="rounded-2xl bg-white p-8 text-red-600 ring-1 ring-slate-200">
            {error || "Data tidak ditemukan."}
          </div>

        </div>
      </main>
    );
  }

  /* =========================================================
     STATUS KELENGKAPAN DATA
  ========================================================= */

  const missingFields =
    getMissingFields(data);

  const isReady =
    missingFields.length === 0;

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-4xl px-6 py-10">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-8">

          <button
            onClick={() =>
              router.push("/dashboard")
            }
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
                Detail UKM
              </h1>

              <p className="mt-2 text-slate-500">
                {data.program}
              </p>

            </div>

            <StatusBadge
              status={data.status}
            />

          </div>

        </div>


        {/* =====================================================
            STATUS KELENGKAPAN
        ===================================================== */}

        <div
          className={`mb-6 rounded-2xl p-5 ring-1 ${
            isReady
              ? "bg-emerald-50 ring-emerald-200"
              : "bg-amber-50 ring-amber-200"
          }`}
        >

          <div className="flex items-start gap-3">

            <div className="text-xl">
              {isReady ? "🟢" : "🟠"}
            </div>

            <div>

              <p
                className={`font-bold ${
                  isReady
                    ? "text-emerald-800"
                    : "text-amber-800"
                }`}
              >
                {isReady
                  ? "Data sudah lengkap"
                  : "Data masih perlu dilengkapi"}
              </p>

              {!isReady && (
                <div className="mt-2">

                  <p className="text-sm text-amber-700">
                    Field yang belum diisi:
                  </p>

                  <ul className="mt-1 list-disc pl-5 text-sm text-amber-700">

                    {missingFields.map(
                      (field) => (
                        <li key={field}>
                          {field}
                        </li>
                      )
                    )}

                  </ul>

                </div>
              )}

            </div>

          </div>

        </div>


        {/* =====================================================
            DATA KEGIATAN
        ===================================================== */}

        <Section title="Data Kegiatan">

          <Field
            label="Bidang UKM"
            value={data.program}
          />

          <Field
            label="Jenis kegiatan"
            value={data.tipe_kegiatan}
          />

          <Field
            label="Tanggal pelayanan"
            value={formatDate(
              data.tanggal_pelayanan
            )}
          />

          <Field
            label="Judul laporan kegiatan"
            value={data.judul_laporan}
          />

        </Section>


        {/* =====================================================
            LAPORAN
        ===================================================== */}

        <Section title="Isi Laporan">

          <LongField
            label="Latar belakang"
            value={data.latar_belakang}
          />

          <LongField
            label="Gambaran pelaksanaan"
            value={
              data.gambaran_pelaksanaan
            }
          />

        </Section>


        {/* =====================================================
            KESLING
        ===================================================== */}

        {data.program === "Kesling" && (
          <Section title="Prasyarat Binaan Rumah Sehat">

            <CheckboxStatus
              label="Mempunyai jamban keluarga"
              checked={
                data.mempunyai_jamban_keluarga
              }
            />

            <CheckboxStatus
              label="Mempunyai tempat pembuangan sampah"
              checked={
                data.mempunyai_tempat_pembuangan_sampah
              }
            />

            <CheckboxStatus
              label="Tidak merokok"
              checked={
                data.tidak_merokok
              }
            />

            <CheckboxStatus
              label="Mempunyai air bersih"
              checked={
                data.mempunyai_air_bersih
              }
            />

          </Section>
        )}


        {/* =====================================================
            TELEGRAM RAW INPUT
        ===================================================== */}

        {data.telegram_raw_input && (
          <Section title="Telegram Raw Input">

            <LongField
              label="Input asli Telegram"
              value={
                data.telegram_raw_input
              }
            />

          </Section>
        )}


        {/* =====================================================
            ACTION
        ===================================================== */}

        <section className="mt-6">

          <button
            type="button"
            onClick={() =>
              router.push(
                `/dashboard/ukm/${data.id}/edit`
              )
            }
            className="w-full rounded-2xl bg-slate-900 px-6 py-4 font-semibold text-white transition hover:bg-slate-800"
          >
            ✏️ Edit Data UKM
          </button>

        </section>

      </div>

    </main>
  );
}


/* =========================================================
   SECTION
========================================================= */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6 rounded-2xl bg-white p-6 ring-1 ring-slate-200">

      <h2 className="text-lg font-bold text-slate-900">
        {title}
      </h2>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {children}
      </div>

    </section>
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
  value: string | null;
}) {
  return (
    <div>

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-slate-900">
        {value || "-"}
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
  value: string | null;
}) {
  return (
    <div className="md:col-span-2">

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="mt-2 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-900">
        {value || "-"}
      </div>

    </div>
  );
}


/* =========================================================
   CHECKBOX STATUS
========================================================= */

function CheckboxStatus({
  label,
  checked,
}: {
  label: string;
  checked: boolean | null;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">

      <span className="text-sm font-medium text-slate-900">
        {label}
      </span>

      <span
        className={`rounded-lg px-3 py-1 text-xs font-bold ${
          checked === true
            ? "bg-green-100 text-green-700"
            : checked === false
            ? "bg-slate-100 text-slate-500"
            : "bg-amber-100 text-amber-700"
        }`}
      >
        {checked === true
          ? "Terpenuhi"
          : checked === false
          ? "Tidak"
          : "Belum diisi"}
      </span>

    </div>
  );
}


/* =========================================================
   STATUS
========================================================= */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span
      className={`inline-flex rounded-xl px-4 py-2 text-sm font-bold ${
        status === "needs_review"
          ? "bg-amber-100 text-amber-700"
          : status === "ready"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-slate-100 text-slate-700"
      }`}
    >
      {status === "needs_review"
        ? "Needs Review"
        : status === "ready"
        ? "Ready"
        : status}
    </span>
  );
}


/* =========================================================
   DATE
========================================================= */

function formatDate(
  value: string | null
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