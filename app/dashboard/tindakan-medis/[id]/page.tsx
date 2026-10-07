"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type TmEntry = {
  id: string;
  user_id: string | null;

  sumber_data: string | null;
  no_rekam_medis: string | null;
  inisial_pasien: string | null;
  jenis_kelamin: string | null;

  berat_badan: number | null;
  tinggi_badan: number | null;

  tanggal_pelayanan: string | null;

  nama_dpjp: string | null;

  anamnesis: string | null;
  diagnosis_text: string | null;
  tindakan_medis: string | null;
  standar_prosedur_operasional: string | null;

  status: string;
};

export default function TindakanMedisDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [data, setData] =
    useState<TmEntry | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadData();
  }, [id]);

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
        .from("tm_entries")
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

  function getMissingFields(data: TmEntry) {
    const requiredFields = [
      {
        label: "Sumber Data",
        value: data.sumber_data,
      },
      {
        label: "No. Rekam Medis",
        value: data.no_rekam_medis,
      },
      {
        label: "Inisial pasien",
        value: data.inisial_pasien,
      },
      {
        label: "Jenis kelamin",
        value: data.jenis_kelamin,
      },
      {
        label: "Tanggal pelayanan",
        value: data.tanggal_pelayanan,
      },
      {
        label: "Nama DPJP",
        value: data.nama_dpjp,
      },
      {
        label: "Anamnesis",
        value: data.anamnesis,
      },
      {
        label: "Diagnosis / masalah",
        value: data.diagnosis_text,
      },
      {
        label: "Tindakan medis",
        value: data.tindakan_medis,
      },
      {
        label: "Standar Prosedur Operasional",
        value: data.standar_prosedur_operasional,
      },
    ];

    return requiredFields
      .filter(
        (field) =>
          field.value === null ||
          field.value === undefined ||
          String(field.value).trim() === ""
      )
      .map((field) => field.label);
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

  const missingFields =
    getMissingFields(data);

  const isReady =
    missingFields.length === 0;

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
                Detail Tindakan Medis
              </h1>

              <p className="mt-2 text-slate-500">
                Data tindakan medis pada pasien
              </p>

            </div>

            <StatusBadge
              status={data.status}
            />

          </div>

        </div>


        {/* =================================================
            STATUS KELENGKAPAN
        ================================================= */}

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


        {/* =================================================
            DATA PASIEN
        ================================================= */}

        <Section title="Data Pasien">

          <Field
            label="Sumber Data"
            value={data.sumber_data}
          />

          <Field
            label="No. Rekam Medis"
            value={data.no_rekam_medis}
          />

          <Field
            label="Inisial pasien"
            value={data.inisial_pasien}
          />

          <Field
            label="Jenis kelamin"
            value={data.jenis_kelamin}
          />

          <Field
            label="Berat badan"
            value={
              data.berat_badan !== null
                ? `${data.berat_badan} kg`
                : null
            }
          />

          <Field
            label="Tinggi badan"
            value={
              data.tinggi_badan !== null
                ? `${data.tinggi_badan} cm`
                : null
            }
          />

          <Field
            label="Tanggal pelayanan"
            value={formatDate(
              data.tanggal_pelayanan
            )}
          />

          <Field
            label="Nama DPJP"
            value={data.nama_dpjp}
          />

        </Section>


        {/* =================================================
            DATA KLINIS
        ================================================= */}

        <Section title="Data Klinis">

          <LongField
            label="Anamnesis"
            value={data.anamnesis}
          />

          <Field
            label="Diagnosis / masalah"
            value={data.diagnosis_text}
          />

          <LongField
            label="Tindakan medis"
            value={data.tindakan_medis}
          />

          <LongField
            label="Standar Prosedur Operasional"
            value={
              data.standar_prosedur_operasional
            }
          />

        </Section>


        {/* =================================================
            ACTION
        ================================================= */}

        <section className="mt-6">

          <button
            type="button"
            onClick={() =>
              router.push(
                `/dashboard/tindakan-medis/${data.id}/edit`
              )
            }
            className="w-full rounded-2xl bg-slate-900 px-6 py-4 font-semibold text-white transition hover:bg-slate-800"
          >
            ✏️ Edit Data Tindakan Medis
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
  value: string | number | null;
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
   STATUS
========================================================= */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span className="inline-flex rounded-xl bg-amber-100 px-4 py-2 text-sm font-bold text-amber-700">
      {status === "needs_review"
        ? "Needs Review"
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