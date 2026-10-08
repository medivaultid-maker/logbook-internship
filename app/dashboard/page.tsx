"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type UkpEntry = {
  id: string;

  tanggal_pelayanan: string | null;
  no_rm: string | null;
  jenis_tindakan: string | null;
  sumber_data: string | null;
  jenis_kelamin: string | null;
  kategori_pasien: string | null;
  kategori_kasus: string | null;

  tb: number | null;
  bb: number | null;

  anamnesis: string | null;
  pemeriksaan_fisik: string | null;
  pemeriksaan_penunjang: string | null;

  diagnosis: string | null;
  diagnosis_banding: string | null;

  farmakoterapi: string | null;
  non_farmakoterapi: string | null;
  monitoring_evaluasi: string | null;

  status_rujukan: string | null;
  inisial_pasien: string | null;

  status: string | null;
};


/* =========================================================
   COMPLETENESS
========================================================= */

function getCompleteness(item: UkpEntry) {
  const fields = [
    item.tanggal_pelayanan,
    item.no_rm,
    item.jenis_tindakan,
    item.sumber_data,
    item.jenis_kelamin,
    item.kategori_pasien,
    item.kategori_kasus,
    item.inisial_pasien,

    item.anamnesis,
    item.pemeriksaan_fisik,
    item.pemeriksaan_penunjang,

    item.diagnosis,

    item.farmakoterapi,
    item.non_farmakoterapi,
    item.monitoring_evaluasi,

    item.status_rujukan,
  ];

  const filled = fields.filter(
    (value) =>
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
  ).length;

  return Math.round(
    (filled / fields.length) * 100
  );
}


/* =========================================================
   STATUS
========================================================= */

function getStatus(item: UkpEntry) {
  const completeness = getCompleteness(item);

  return completeness === 100
    ? "ready"
    : "needs_review";
}


/* =========================================================
   DASHBOARD
========================================================= */

export default function DashboardPage() {
  const [entries, setEntries] =
    useState<UkpEntry[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [filter, setFilter] =
    useState<
      "Semua" | "needs_review" | "ready"
    >("Semua");


  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    loadEntries();
  }, []);


  async function loadEntries() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }

    const { data, error } =
      await supabase
        .from("ukp")
        .select("*")
        .order("tanggal_pelayanan", {
          ascending: false,
        });

    if (error) {
      console.error(
        "Gagal mengambil data UKP:",
        error.message
      );

      setEntries([]);
      setLoading(false);
      return;
    }

    const normalizedData: UkpEntry[] =
      (data || []).map((item: any) => ({
        ...item,

        status:
          item.status ||
          getStatus(item),
      }));

    setEntries(normalizedData);
    setLoading(false);
  }


  /* =========================================================
     FILTER
  ========================================================= */

  const filteredEntries =
    entries.filter((entry) => {
      if (filter === "Semua") {
        return true;
      }

      return (
        entry.status === filter
      );
    });


  /* =========================================================
     SUMMARY
  ========================================================= */

  const jumlahSemua =
    entries.length;

  const jumlahNeedsReview =
    entries.filter(
      (entry) =>
        entry.status ===
        "needs_review"
    ).length;

  const jumlahReady =
    entries.filter(
      (entry) =>
        entry.status === "ready"
    ).length;


  /* =========================================================
     UI
  ========================================================= */

  return (
    <main className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-6xl px-6 py-10">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">

          <p className="text-sm font-semibold text-teal-600">
            LOGBOOK INTERNSIP
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Dashboard UKP
          </h1>

          <p className="mt-2 text-slate-500">
            Semua data Upaya Kesehatan Perseorangan
            yang tersimpan.
          </p>

        </div>


        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="grid gap-4 md:grid-cols-3">

          <SummaryCard
            label="Semua Data"
            value={jumlahSemua}
          />

          <SummaryCard
            label="Needs Review"
            value={jumlahNeedsReview}
          />

          <SummaryCard
            label="Ready"
            value={jumlahReady}
          />

        </div>


        {/* =================================================
            FILTER
        ================================================= */}

        <section className="mt-8 rounded-2xl bg-white p-4 ring-1 ring-slate-200">

          <div className="flex flex-wrap gap-2">

            {[
              {
                label: "Semua",
                value: "Semua",
              },
              {
                label: "🟠 Needs Review",
                value: "needs_review",
              },
              {
                label: "🟢 Ready",
                value: "ready",
              },
            ].map((item) => (

              <button
                key={item.value}
                type="button"
                onClick={() =>
                  setFilter(
                    item.value as
                      | "Semua"
                      | "needs_review"
                      | "ready"
                  )
                }
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  filter === item.value
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {item.label}
              </button>

            ))}

          </div>

        </section>


        {/* =================================================
            DATA
        ================================================= */}

        <section className="mt-6">

          {loading ? (

            <div className="rounded-2xl bg-white p-8 text-center text-slate-500 ring-1 ring-slate-200">
              Memuat data...
            </div>

          ) : filteredEntries.length === 0 ? (

            <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-slate-200">

              <p className="text-lg font-semibold text-slate-900">
                Belum ada data UKP
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Data UKP yang kamu simpan akan muncul
                di sini.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {filteredEntries.map(
                (entry) => (

                  <EntryCard
                    key={entry.id}
                    entry={entry}
                  />

                )
              )}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}


/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {

  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">

      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}


/* =========================================================
   ENTRY CARD
========================================================= */

function EntryCard({
  entry,
}: {
  entry: UkpEntry;
}) {

  const completeness =
    getCompleteness(entry);

  const status =
    entry.status ||
    getStatus(entry);


  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">


        {/* =================================================
            INFO
        ================================================= */}

        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-2">

            <span className="rounded-lg bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
              UKP
            </span>

            <StatusBadge
              status={status}
            />

          </div>


          {/* DIAGNOSIS */}

          <h2 className="mt-3 text-lg font-bold text-slate-900">

            {entry.diagnosis ||
              "Diagnosis belum diisi"}

          </h2>


          {/* TINDAKAN */}

          <p className="mt-1 text-sm text-slate-500">

            {entry.jenis_tindakan ||
              "Jenis tindakan belum diisi"}

          </p>


          {/* PASIEN */}

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">

            <span>
              {entry.inisial_pasien
                ? `Pasien: ${entry.inisial_pasien}`
                : "Pasien: -"}
            </span>

            <span>
              {entry.no_rm
                ? `RM: ${entry.no_rm}`
                : "RM: -"}
            </span>

          </div>


          {/* TANGGAL */}

          <p className="mt-2 text-sm text-slate-400">

            {formatDate(
              entry.tanggal_pelayanan
            )}

          </p>


          {/* =================================================
              KELENGKAPAN
          ================================================= */}

          <div className="mt-4">

            <div className="mb-1 flex justify-between text-xs">

              <span className="font-medium text-slate-500">
                Kelengkapan data
              </span>

              <span className="font-bold text-slate-700">
                {completeness}%
              </span>

            </div>


            <div className="h-2 overflow-hidden rounded-full bg-slate-100">

              <div
                className="h-full rounded-full bg-slate-900 transition-all"
                style={{
                  width: `${completeness}%`,
                }}
              />

            </div>

          </div>

        </div>


        {/* =================================================
            BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={() => {
            window.location.href =
              `/dashboard/ukp/${entry.id}`;
          }}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Buka
        </button>

      </div>

    </div>
  );
}


/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: string;
}) {

  const normalized =
    status.toLowerCase();


  if (
    normalized ===
    "needs_review"
  ) {

    return (
      <span className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
        🟠 Needs Review
      </span>
    );

  }


  if (
    normalized ===
    "ready"
  ) {

    return (
      <span className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
        🟢 Ready
      </span>
    );

  }


  return (
    <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
      {status}
    </span>
  );
}


/* =========================================================
   DATE
========================================================= */

function formatDate(
  value: string | null
) {

  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
}