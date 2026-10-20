
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  kemenkes_status: string;
  kemenkes_draft_created_at: string | null;
};

type Filter = "Semua" | "needs_review" | "ready";

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

  return Math.round((filled / fields.length) * 100);
}

function getStatus(item: UkpEntry) {
  return getCompleteness(item) === 100 ? "ready" : "needs_review";
}

function hasKemenkesDraft(item: UkpEntry) {
  return (
    item.kemenkes_status === "draft_created" ||
    item.kemenkes_status === "sent"
  );
}

function formatDate(value: string | null) {
  if (!value) return "-";

  // Ambil tanggal kalender tanpa menggeser hari akibat zona waktu.
  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

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

export default function DashboardPage() {
  const router = useRouter();

  const [entries, setEntries] = useState<UkpEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("Semua");
  const [pageMessage, setPageMessage] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  // =========================
  // MEMUAT DATA
  // =========================

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setPageMessage("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session) {
        setEntries([]);
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("ukp")
        .select("*")
        .eq("user_id", session.user.id)
        .order("tanggal_pelayanan", {
          ascending: false,
        });

      if (error) throw error;

      setEntries((data ?? []) as UkpEntry[]);
    } catch (error) {
      console.error("Gagal memuat UKP:", error);

      setPageMessage(
        error instanceof Error
          ? `Gagal memuat data: ${error.message}`
          : "Gagal memuat data UKP."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  // =========================
  // LOGOUT
  // =========================

  async function handleLogout() {
    if (loggingOut) return;

    if (!window.confirm("Yakin ingin logout?")) return;

    setLoggingOut(true);
    setPageMessage("");

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Gagal logout:", error);

      setPageMessage(
        error instanceof Error
          ? `Gagal logout: ${error.message}`
          : "Gagal logout. Silakan coba lagi."
      );

      setLoggingOut(false);
    }
  }

  // =========================
  // HAPUS DATA
  // =========================

  async function deleteEntry(entry: UkpEntry) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus data UKP ini?\n\n` +
        `Pasien: ${entry.inisial_pasien || "-"}\n` +
        `Tanggal: ${formatDate(entry.tanggal_pelayanan)}\n\n` +
        "Data yang dihapus tidak dapat dipulihkan."
    );

    if (!confirmed) return;

    setPageMessage("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session) {
        throw new Error("Sesi login tidak ditemukan.");
      }

      const { data, error } = await supabase
        .from("ukp")
        .delete()
        .eq("id", entry.id)
        .eq("user_id", session.user.id)
        .select("id");

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error(
          "Data tidak terhapus. Periksa izin DELETE pada kebijakan RLS Supabase."
        );
      }

      setEntries((prev) =>
        prev.filter((item) => item.id !== entry.id)
      );

      setPageMessage("Data UKP berhasil dihapus.");
    } catch (error) {
      console.error("Gagal menghapus UKP:", error);

      setPageMessage(
        error instanceof Error
          ? error.message
          : "Gagal menghapus data UKP."
      );
    }
  }

  // =========================
  // STATISTIK DAN FILTER
  // =========================

  const jumlahSemua = entries.length;

  const jumlahNeedsReview = entries.filter(
    (entry) => getStatus(entry) === "needs_review"
  ).length;

  const jumlahReady = entries.filter(
    (entry) => getStatus(entry) === "ready"
  ).length;

  const filteredEntries = entries.filter((entry) => {
    if (filter === "Semua") return true;
    return getStatus(entry) === filter;
  });

  // =========================
  // TAMPILAN
  // =========================

  return (
    <main className="min-h-screen bg-[#F4F7FA] text-slate-900">
      {/* HEADER NAVIGASI */}

      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex min-w-0 items-center gap-3 text-left"
            aria-label="Beranda dashboard"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#112C46] text-xl font-semibold text-white shadow-lg shadow-slate-900/10">
              +
            </span>

            <span className="min-w-0">
              <span className="block truncate text-base font-bold tracking-tight text-[#11243A] sm:text-lg">
                Logbook Internsip
              </span>

              <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700 sm:text-xs">
                Medical Workflow
              </span>
            </span>
          </button>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => void loadEntries()}
              disabled={loading || loggingOut}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 sm:px-4"
            >
              <span aria-hidden="true">↻</span>
              <span className="hidden sm:inline">
                {loading ? "Memuat..." : "Refresh"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              className="rounded-xl bg-[#112C46] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#193B59] disabled:opacity-50 sm:px-4"
            >
              {loggingOut ? "Keluar..." : "Logout"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        {/* JUDUL HALAMAN */}

        <section className="mb-8 flex flex-col justify-between gap-5 sm:mb-10 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3.5 py-1.5">
              <span className="h-2 w-2 rounded-full bg-teal-500" />
              <span className="text-xs font-semibold text-teal-800">
                Ruang kerja dokter internsip
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-[#11243A] sm:text-4xl">
              Dashboard UKP
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Kelola data Upaya Kesehatan Perseorangan, pantau
              kelengkapan, dan siapkan Draft Kemenkes dalam satu tempat.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg">
              ▤
            </span>
            <span>
              <span className="block font-semibold text-slate-800">
                {jumlahSemua} data UKP
              </span>
              <span className="mt-0.5 block text-xs text-slate-400">
                Data akun kamu
              </span>
            </span>
          </div>
        </section>

        {/* PESAN */}

        {pageMessage && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-700 shadow-sm"
          >
            <span className="font-bold text-teal-700">i</span>
            <p className="leading-6">{pageMessage}</p>
          </div>
        )}

        {/* STATISTIK */}

        <section aria-label="Ringkasan data UKP">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-[#11243A] sm:text-lg">
              Ringkasan logbook
            </h2>
            <span className="text-xs text-slate-400">
              Statistik data tersimpan
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryCard
              label="Total data UKP"
              value={jumlahSemua}
              description="Seluruh data yang tersimpan"
              icon="▤"
              accent="navy"
            />

            <SummaryCard
              label="Perlu dilengkapi"
              value={jumlahNeedsReview}
              description="Data yang belum lengkap"
              icon="◷"
              accent="amber"
            />

            <SummaryCard
              label="Siap diproses"
              value={jumlahReady}
              description="Kelengkapan data mencapai 100%"
              icon="✓"
              accent="teal"
            />
          </div>
        </section>

        {/* DAFTAR UKP */}

        <section className="mt-9 sm:mt-11">
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#11243A]">
                Data pelayanan
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Periksa kelengkapan dan kelola setiap entri UKP.
              </p>
            </div>

            <span className="text-sm text-slate-500">
              Menampilkan{" "}
              <span className="font-bold text-slate-800">
                {filteredEntries.length}
              </span>{" "}
              data
            </span>
          </div>

          {/* FILTER */}

          <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm">
            {[
              { label: "Semua data", value: "Semua" },
              { label: "Perlu dilengkapi", value: "needs_review" },
              { label: "Siap diproses", value: "ready" },
            ].map((item) => {
              const active = filter === item.value;

              const count =
                item.value === "Semua"
                  ? jumlahSemua
                  : item.value === "ready"
                    ? jumlahReady
                    : jumlahNeedsReview;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value as Filter)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition sm:px-4 ${
                    active
                      ? "bg-[#112C46] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                  <span
                    className={`rounded-lg px-2 py-0.5 text-xs ${
                      active
                        ? "bg-white/15 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ISI DAFTAR */}

          {loading ? (
            <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600" />
              <p className="font-semibold text-slate-800">
                Memuat data UKP
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Mohon tunggu sebentar...
              </p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-500">
                ▤
              </div>

              <h3 className="mt-5 text-lg font-bold text-[#11243A]">
                {entries.length === 0
                  ? "Belum ada data UKP"
                  : "Tidak ada data yang sesuai"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {entries.length === 0
                  ? "Data UKP yang kamu simpan akan muncul di halaman ini."
                  : "Coba pilih filter lain untuk melihat data UKP yang tersimpan."}
              </p>

              {entries.length > 0 && filter !== "Semua" && (
                <button
                  type="button"
                  onClick={() => setFilter("Semua")}
                  className="mt-5 rounded-xl bg-[#112C46] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#193B59]"
                >
                  Tampilkan semua data
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onOpen={() =>
                    router.push(`/dashboard/ukp/${entry.id}`)
                  }
                  onDelete={() => deleteEntry(entry)}
                  onSent={loadEntries}
                />
              ))}
            </div>
          )}
        </section>

        {/* FOOTER */}

        <footer className="mt-12 border-t border-slate-200/80 py-6">
          <div className="flex flex-col justify-between gap-2 text-xs text-slate-400 sm:flex-row sm:items-center">
            <p>Logbook Internsip · Medical Workflow Platform</p>
            <p>Ruang kerja dokter internsip</p>
          </div>
        </footer>
      </div>
    </main>
  );
}

// =========================
// KARTU STATISTIK
// =========================

function SummaryCard({
  label,
  value,
  description,
  icon,
  accent,
}: {
  label: string;
  value: number;
  description: string;
  icon: string;
  accent: "navy" | "amber" | "teal";
}) {
  const styles = {
    navy: {
      icon: "bg-slate-100 text-[#112C46]",
      bar: "bg-[#112C46]",
    },
    amber: {
      icon: "bg-amber-50 text-amber-700",
      bar: "bg-amber-500",
    },
    teal: {
      icon: "bg-teal-50 text-teal-700",
      bar: "bg-teal-600",
    },
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-4xl font-bold tracking-tight text-[#11243A]">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xl font-semibold ${styles[accent].icon}`}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-400">
        {description}
      </p>

      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-slate-100">
        <div className={`h-full w-1/3 ${styles[accent].bar}`} />
      </div>
    </div>
  );
}

// =========================
// KARTU DATA UKP
// =========================

function EntryCard({
  entry,
  onOpen,
  onDelete,
  onSent,
}: {
  entry: UkpEntry;
  onOpen: () => void;
  onDelete: () => Promise<void>;
  onSent: () => Promise<void>;
}) {
  const completeness = getCompleteness(entry);
  const status = getStatus(entry);
  const alreadyCreated = hasKemenkesDraft(entry);

  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [syncError, setSyncError] = useState("");

  // =========================
  // KIRIM DRAFT KEMENKES
  // =========================

  async function handleSendToKemenkes() {
    if (sending || alreadyCreated || status !== "ready") return;

    const confirmed = window.confirm(
      "Kirim data ini untuk dibuat sebagai Draft Kemenkes?"
    );

    if (!confirmed) return;

    setSending(true);
    setSyncMessage("");
    setSyncError("");

    try {
      const response = await fetch("/api/kemenkes/ukp/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entry),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Gagal membuat Draft Kemenkes."
        );
      }

      const {
        data: updatedRows,
        error: updateError,
      } = await supabase
        .from("ukp")
        .update({
          kemenkes_status: "draft_created",
          kemenkes_draft_created_at: new Date().toISOString(),
        })
        .eq("id", entry.id)
        .select("id");

      if (updateError) {
        throw new Error(
          "Draft mungkin sudah dibuat, tetapi status penguncian gagal disimpan. " +
            updateError.message
        );
      }

      if (!updatedRows || updatedRows.length === 0) {
        throw new Error(
          "Draft mungkin sudah dibuat, tetapi status tidak tersimpan. Periksa izin UPDATE pada RLS Supabase."
        );
      }

      setSyncMessage(
        "Draft Kemenkes berhasil dibuat. Tombol pengiriman dikunci."
      );

      await onSent();
    } catch (error) {
      console.error("Gagal memproses Draft Kemenkes:", error);

      setSyncError(
        error instanceof Error ? error.message : "Terjadi kesalahan."
      );
    } finally {
      setSending(false);
    }
  }

  // =========================
  // HAPUS DATA
  // =========================

  async function handleDelete() {
    if (deleting) return;

    setDeleting(true);

    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  }

  // =========================
  // TAMPILAN KARTU
  // =========================

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-200 hover:border-slate-300 hover:shadow-md">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            {/* BADGE */}

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg border border-teal-100 bg-teal-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-teal-800">
                UKP
              </span>

              <StatusBadge status={status} />

              {alreadyCreated && (
                <span className="rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  Draft Kemenkes dibuat
                </span>
              )}
            </div>

            {/* DIAGNOSIS */}

            <h3 className="mt-4 break-words text-lg font-bold leading-snug text-[#11243A] sm:text-xl">
              {entry.diagnosis || "Diagnosis belum diisi"}
            </h3>

            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              {entry.jenis_tindakan || "Jenis tindakan belum diisi"}
            </p>

            {/* INFORMASI PASIEN */}

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <InfoItem
                label="Inisial pasien"
                value={entry.inisial_pasien || "-"}
              />

              <InfoItem
                label="Nomor rekam medis"
                value={entry.no_rm || "-"}
              />

              <InfoItem
                label="Tanggal pelayanan"
                value={formatDate(entry.tanggal_pelayanan)}
              />
            </div>

            {/* KELENGKAPAN */}

            <div className="mt-6 max-w-xl">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-600">
                  Kelengkapan data
                </span>

                <span
                  className={`text-sm font-bold ${
                    completeness === 100
                      ? "text-teal-700"
                      : "text-slate-700"
                  }`}
                >
                  {completeness}%
                </span>
              </div>

              <div
                className="h-2 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-label="Kelengkapan data"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={completeness}
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    completeness === 100
                      ? "bg-teal-600"
                      : "bg-[#173B5A]"
                  }`}
                  style={{ width: `${completeness}%` }}
                />
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                {completeness === 100
                  ? "Semua kolom yang dinilai sudah terisi."
                  : "Lengkapi data sebelum membuat Draft Kemenkes."}
              </p>
            </div>

            {/* PESAN */}

            {syncMessage && (
              <div
                role="status"
                className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800"
              >
                <span className="font-bold">Berhasil. </span>
                {syncMessage}
              </div>
            )}

            {syncError && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
              >
                <span className="font-bold">Perhatian. </span>
                {syncError}
              </div>
            )}
          </div>

          {/* AKSI */}

          <div className="flex shrink-0 flex-col gap-2 border-t border-slate-100 pt-4 lg:w-48 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            <button
              type="button"
              onClick={onOpen}
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <span aria-hidden="true">↗</span>
              Buka detail
            </button>

            <button
              type="button"
              onClick={() => void handleSendToKemenkes()}
              disabled={
                status !== "ready" ||
                alreadyCreated ||
                sending ||
                deleting
              }
              title={
                alreadyCreated
                  ? "Draft Kemenkes sudah dibuat"
                  : status !== "ready"
                    ? "Lengkapi data terlebih dahulu"
                    : "Buat Draft Kemenkes"
              }
              className="flex min-h-11 items-center justify-center rounded-xl bg-[#112C46] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-slate-900/10 transition hover:bg-[#193B59] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
            >
              {sending
                ? "Memproses..."
                : alreadyCreated
                  ? "Draft sudah dibuat"
                  : status !== "ready"
                    ? "Belum lengkap"
                    : "Kirim ke Kemenkes"}
            </button>

            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={deleting || sending}
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span aria-hidden="true">×</span>
              {deleting ? "Menghapus..." : "Hapus data"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

// =========================
// INFORMASI PASIEN
// =========================

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-[#F7F9FC] px-3.5 py-3">
      <p className="text-[11px] font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

// =========================
// BADGE STATUS
// =========================

function StatusBadge({ status }: { status: string }) {
  if (status === "needs_review") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Perlu dilengkapi
      </span>
    );
  }

  if (status === "ready") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-teal-100 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800">
        <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
        Siap diproses
      </span>
    );
  }

  return (
    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
      {status}
    </span>
  );
}
