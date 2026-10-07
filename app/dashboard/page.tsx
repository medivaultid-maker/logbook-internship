"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Entry = {
  id: string;
  jenis: "UKP" | "UKM" | "Tindakan Medis";
  tanggal: string | null;
  judul: string;
  detail: string;
  status: string;
  completeness: number;
};


/* =========================================================
   COMPLETENESS
========================================================= */

function getCompleteness(
  item: any,
  jenis: Entry["jenis"]
) {
  let fields: any[] = [];

  if (jenis === "UKP") {
    fields = [
      item.jenis_tindakan,
      item.no_rekam_medis,
      item.sumber_data,
      item.tanggal_pelayanan,
      item.inisial_pasien,
      item.jenis_kelamin,
      item.kategori_pasien,
      item.kategori_kasus,
      item.anamnesis,
      item.pemeriksaan_fisik,
      item.diagnosis_text,
      item.farmakoterapi,
      item.non_farmakoterapi,
      item.monitoring_evaluasi,
      item.status_rujukan,
    ];
  }

  if (jenis === "UKM") {
    fields = [
      item.program,
      item.tipe_kegiatan,
      item.tanggal_pelayanan,
      item.judul_laporan,
      item.latar_belakang,
      item.gambaran_pelaksanaan,
    ];
  }

  if (jenis === "Tindakan Medis") {
    fields = [
      item.sumber_data,
      item.no_rekam_medis,
      item.inisial_pasien,
      item.jenis_kelamin,
      item.tanggal_pelayanan,
      item.nama_dpjp,
      item.anamnesis,
      item.diagnosis_text,
      item.tindakan_medis,
      item.standar_prosedur_operasional,
    ];
  }

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

function getStatus(
  item: any,
  jenis: Entry["jenis"]
) {
  return getCompleteness(item, jenis) === 100
    ? "ready"
    : "needs_review";
}

export default function DashboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "Semua" | "UKP" | "UKM" | "Tindakan Medis"
  >("Semua");

  const [statusFilter, setStatusFilter] = useState<
  "Semua" | "needs_review" | "ready"
>("Semua");

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

    const [ukpResult, ukmResult, tmResult] =
      await Promise.all([
        supabase
          .from("ukp_entries")
          .select("*")
          .eq("user_id", user.id)
          .order("tanggal_pelayanan", {
            ascending: false,
          }),

        supabase
          .from("ukm_entries")
          .select("*")
          .eq("user_id", user.id)
          .order("tanggal_pelayanan", {
            ascending: false,
          }),

        supabase
          .from("tm_entries")
          .select("*")
          .eq("user_id", user.id)
          .order("tanggal_pelayanan", {
            ascending: false,
          }),
      ]);

    const combined: Entry[] = [];

    /* =========================
       UKP
    ========================= */

    if (!ukpResult.error && ukpResult.data) {
      ukpResult.data.forEach((item: any) => {
        combined.push({
          id: item.id,
          jenis: "UKP",
          tanggal: item.tanggal_pelayanan,
          judul:
            item.diagnosis_text ||
            item.diagnosis ||
            "Data UKP",
          detail:
            item.jenis_tindakan ||
            item.tindakan ||
            "Upaya Kesehatan Perseorangan",
          status: getStatus(item, "UKP"),
          completeness: getCompleteness(
  item,
  "UKP"
),
        });
      });
    }


    /* =========================
       UKM
    ========================= */

    if (!ukmResult.error && ukmResult.data) {
      ukmResult.data.forEach((item: any) => {
        combined.push({
          id: item.id,
          jenis: "UKM",
          tanggal: item.tanggal_pelayanan,
          judul:
            item.judul_laporan ||
            item.tipe_kegiatan ||
            "Data UKM",
          detail:
            item.program ||
            item.jenis_ukm ||
            item.tipe_kegiatan ||
            "Upaya Kesehatan Masyarakat",
          status: getStatus(item, "UKM"),
          completeness: getCompleteness(
  item,
  "UKM"
),
        });
      });
    }

    

    /* =========================
       TINDAKAN MEDIS
    ========================= */

    if (!tmResult.error && tmResult.data) {
      tmResult.data.forEach((item: any) => {
        combined.push({
          id: item.id,
          jenis: "Tindakan Medis",
          tanggal: item.tanggal_pelayanan,
          judul:
            item.diagnosis_text ||
            "Tindakan medis",
          detail:
            item.tindakan_medis ||
            "Tindakan medis pada pasien",
          status: getStatus(item, "Tindakan Medis"),
          completeness: getCompleteness(
  item,
  "Tindakan Medis"
),
        });
      });
    }

    /* =========================
       SORT SEMUA DATA
    ========================= */

    combined.sort((a, b) => {
      const dateA = a.tanggal
        ? new Date(a.tanggal).getTime()
        : 0;

      const dateB = b.tanggal
        ? new Date(b.tanggal).getTime()
        : 0;

      return dateB - dateA;
    });

    setEntries(combined);
    setLoading(false);
  }

  const filteredEntries = entries.filter((entry) => {
  const cocokJenis =
    filter === "Semua" ||
    entry.jenis === filter;

  const cocokStatus =
    statusFilter === "Semua" ||
    entry.status === statusFilter;

  return cocokJenis && cocokStatus;
});

  const jumlahUKP = entries.filter(
    (x) => x.jenis === "UKP"
  ).length;

  const jumlahUKM = entries.filter(
    (x) => x.jenis === "UKM"
  ).length;

  const jumlahTM = entries.filter(
    (x) => x.jenis === "Tindakan Medis"
  ).length;

  const jumlahNeedsReview = entries.filter(
  (x) => x.status === "needs_review"
).length;

const jumlahReady = entries.filter(
  (x) => x.status === "ready"
).length;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* HEADER */}

        <div className="mb-8">
          <p className="text-sm font-semibold text-teal-600">
            LOGBOOK INTERNSIP
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Dashboard Draft
          </h1>

          <p className="mt-2 text-slate-500">
            Semua data UKP, UKM, dan Tindakan Medis
            yang tersimpan.
          </p>
        </div>

        {/* SUMMARY */}

        <div className="grid gap-4 md:grid-cols-6">

          <SummaryCard
            label="Semua Draft"
            value={entries.length}
          />

          <SummaryCard
            label="UKP"
            value={jumlahUKP}
          />

          <SummaryCard
            label="UKM"
            value={jumlahUKM}
          />

          <SummaryCard
            label="Tindakan Medis"
            value={jumlahTM}
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

        {/* FILTER */}

<section className="mt-8 rounded-2xl bg-white p-4 ring-1 ring-slate-200">

  {/* FILTER JENIS */}

  <div className="flex flex-wrap gap-2">

    {[
      "Semua",
      "UKP",
      "UKM",
      "Tindakan Medis",
    ].map((item) => (
      <button
        key={item}
        type="button"
        onClick={() =>
          setFilter(
            item as
              | "Semua"
              | "UKP"
              | "UKM"
              | "Tindakan Medis"
          )
        }
        className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
          filter === item
            ? "bg-slate-900 text-white"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
        }`}
      >
        {item}
      </button>
    ))}

  </div>


  {/* FILTER STATUS */}

  <div className="mt-3 flex flex-wrap gap-2">

    {[
      {
        label: "Semua Status",
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
          setStatusFilter(
            item.value as
              | "Semua"
              | "needs_review"
              | "ready"
          )
        }
        className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
          statusFilter === item.value
            ? "bg-slate-900 text-white"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
        }`}
      >
        {item.label}
      </button>
    ))}

  </div>

</section>

        {/* DATA */}

        <section className="mt-6">

          {loading ? (
            <div className="rounded-2xl bg-white p-8 text-center text-slate-500 ring-1 ring-slate-200">
              Memuat data...
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-slate-200">

              <p className="text-lg font-semibold text-slate-900">
                Belum ada data
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Data yang kamu simpan akan muncul
                di sini.
              </p>

            </div>
          ) : (
            <div className="space-y-4">

              {filteredEntries.map((entry) => (
                <EntryCard
                  key={`${entry.jenis}-${entry.id}`}
                  entry={entry}
                />
              ))}

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
  entry: Entry;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-2">

            <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              {entry.jenis}
            </span>

            <StatusBadge status={entry.status} />

          </div>

          <h2 className="mt-3 text-lg font-bold text-slate-900">
            {entry.judul}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {entry.detail}
          </p>

          <p className="mt-3 text-sm text-slate-400">
            {formatDate(entry.tanggal)}
          </p>

          {/* KELENGKAPAN DATA */}

          <div className="mt-4">

            <div className="mb-1 flex justify-between text-xs">

              <span className="font-medium text-slate-500">
                Kelengkapan data
              </span>

              <span className="font-bold text-slate-700">
                {entry.completeness}%
              </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">

              <div
                className="h-full rounded-full bg-slate-900 transition-all"
                style={{
                  width: `${entry.completeness}%`,
                }}
              />

            </div>

          </div>

        </div>


        {/* BUTTON */}

        <button
          type="button"
          onClick={() => {
            if (entry.jenis === "UKP") {
              window.location.href =
                `/dashboard/ukp/${entry.id}`;
            }

            if (entry.jenis === "UKM") {
              window.location.href =
                `/dashboard/ukm/${entry.id}`;
            }

            if (entry.jenis === "Tindakan Medis") {
              window.location.href =
                `/dashboard/tindakan-medis/${entry.id}`;
            }
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
   STATUS
========================================================= */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized = status.toLowerCase();

  if (normalized === "needs_review") {
    return (
      <span className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
        🟠 Needs Review
      </span>
    );
  }

  if (normalized === "ready") {
    return (
      <span className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
        🟢 Ready
      </span>
    );
  }

  if (normalized === "generated") {
    return (
      <span className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
        Generated
      </span>
    );
  }

  if (normalized === "submitted") {
    return (
      <span className="rounded-lg bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
        Submitted
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