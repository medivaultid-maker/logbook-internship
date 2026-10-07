"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type UkpEntry = {
  id: string;
  user_id: string | null;

  jenis_tindakan: string | null;
  no_rekam_medis: string | null;
  sumber_data: string | null;
  tanggal_pelayanan: string | null;

  inisial_pasien: string | null;
  jenis_kelamin: string | null;
  kategori_pasien: string | null;
  kategori_kasus: string | null;

  berat_badan: number | null;
  tinggi_badan: number | null;

  anamnesis: string | null;
  pemeriksaan_fisik: string | null;
  pemeriksaan_penunjang: string | null;

  diagnosis_id: string | null;
  diagnosis_text: string | null;

  tata_laksana: string | null;

  farmakoterapi: string | null;
  non_farmakoterapi: string | null;
  monitoring_evaluasi: string | null;

  diagnosis_banding_id: string | null;
  diagnosis_banding_text: string | null;

  status_rujukan: string | null;
  status: string;
};

export default function UkpDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [data, setData] = useState<UkpEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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
      setError("Sesi login tidak ditemukan.");
      setLoading(false);
      return;
    }

    const { data: entry, error } = await supabase
      .from("ukp_entries")
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

  function getMissingFields(data: UkpEntry) {
    const requiredFields = [
      {
        label: "Jenis tindakan",
        value: data.jenis_tindakan,
      },
      {
        label: "No. Rekam Medis",
        value: data.no_rekam_medis,
      },
      {
        label: "Sumber Data",
        value: data.sumber_data,
      },
      {
        label: "Tanggal pelayanan",
        value: data.tanggal_pelayanan,
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
        label: "Kategori pasien",
        value: data.kategori_pasien,
      },
      {
        label: "Kategori kasus",
        value: data.kategori_kasus,
      },
      {
        label: "Anamnesis",
        value: data.anamnesis,
      },
      {
        label: "Pemeriksaan fisik",
        value: data.pemeriksaan_fisik,
      },
      {
        label: "Diagnosis / masalah",
        value: data.diagnosis_text,
      },
      {
        label: "Tata laksana",
        value: data.tata_laksana,
      },
      {
        label: "Farmakoterapi",
        value: data.farmakoterapi,
      },
      {
        label: "Non-Farmakoterapi",
        value: data.non_farmakoterapi,
      },
      {
        label: "Monitoring dan evaluasi",
        value: data.monitoring_evaluasi,
      },
      {
        label: "Status rujukan",
        value: data.status_rujukan,
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
     TANDAI READY
  ========================================================= */

  async function markAsReady() {
    if (!data) return;

    const missingFields = getMissingFields(data);

    if (missingFields.length > 0) {
      alert(
        `Data belum lengkap.\n\nField yang perlu dilengkapi:\n- ${missingFields.join(
          "\n- "
        )}`
      );

      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Sesi login tidak ditemukan.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("ukp_entries")
      .update({
        status: "ready",
      })
      .eq("id", data.id)
      .eq("user_id", user.id);

    if (error) {
      alert(
        `Gagal mengubah status:\n${error.message}`
      );

      setSaving(false);
      return;
    }

    setData({
      ...data,
      status: "ready",
    });

    setSaving(false);
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
     VALIDASI
  ========================================================= */

  const missingFields = getMissingFields(data);
  const isComplete = missingFields.length === 0;

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
                Detail UKP
              </h1>

              <p className="mt-2 text-slate-500">
                Detail data Upaya Kesehatan Perseorangan
              </p>

            </div>

            <StatusBadge
              status={data.status}
            />

          </div>

        </div>

        {/* =================================================
            VALIDATION BOX
        ================================================= */}

        <div
          className={`mb-6 rounded-2xl p-5 ring-1 ${
            isComplete
              ? "bg-emerald-50 ring-emerald-200"
              : "bg-amber-50 ring-amber-200"
          }`}
        >

          <div className="flex items-start gap-3">

            <div className="text-xl">
              {isComplete ? "🟢" : "🟠"}
            </div>

            <div>

              <p
                className={`font-bold ${
                  isComplete
                    ? "text-emerald-800"
                    : "text-amber-800"
                }`}
              >
                {isComplete
                  ? "Data sudah lengkap"
                  : "Data masih perlu dilengkapi"}
              </p>

              {!isComplete && (
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

              {isComplete && (
                <p className="mt-1 text-sm text-emerald-700">
                  Semua field wajib sudah terisi.
                </p>
              )}

            </div>

          </div>

        </div>

        {/* =================================================
            DATA PASIEN
        ================================================= */}

        <Section title="Data Pasien">

          <Field
            label="Jenis tindakan"
            value={data.jenis_tindakan}
          />

          <Field
            label="No. Rekam Medis"
            value={data.no_rekam_medis}
          />

          <Field
            label="Sumber Data"
            value={data.sumber_data}
          />

          <Field
            label="Tanggal pelayanan"
            value={formatDate(
              data.tanggal_pelayanan
            )}
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
            label="Kategori pasien"
            value={data.kategori_pasien}
          />

          <Field
            label="Kategori kasus"
            value={data.kategori_kasus}
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

        </Section>

        {/* =================================================
            DATA KLINIS
        ================================================= */}

        <Section title="Data Klinis">

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

          <Field
            label="Diagnosis / masalah"
            value={data.diagnosis_text}
          />

          <LongField
            label="Tata laksana"
            value={data.tata_laksana}
          />

          <LongField
            label="Farmakoterapi"
            value={data.farmakoterapi}
          />

          <LongField
            label="Non-Farmakoterapi"
            value={data.non_farmakoterapi}
          />

          <LongField
            label="Monitoring dan evaluasi"
            value={data.monitoring_evaluasi}
          />

          <Field
            label="Diagnosis Banding"
            value={data.diagnosis_banding_text}
          />

          <Field
            label="Status rujukan"
            value={data.status_rujukan}
          />

        </Section>

        {/* =================================================
            ACTION
        ================================================= */}

        <section className="mt-6 space-y-3">

          {/* READY */}

          {data.status === "needs_review" && (
            <button
              type="button"
              onClick={markAsReady}
              disabled={saving || !isComplete}
              className={`w-full rounded-2xl px-6 py-4 font-semibold text-white transition ${
                isComplete
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "cursor-not-allowed bg-slate-300"
              }`}
            >
              {saving
                ? "Menyimpan..."
                : "🟢 Tandai sebagai Ready"}
            </button>
          )}

          {/* EDIT */}

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

      <div className="mt-2 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-900 whitespace-pre-wrap">
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
  const isReady = status === "ready";

  return (
    <span
      className={`inline-flex rounded-xl px-4 py-2 text-sm font-bold ${
        isReady
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {isReady
        ? "🟢 Ready"
        : status === "needs_review"
        ? "🟠 Needs Review"
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