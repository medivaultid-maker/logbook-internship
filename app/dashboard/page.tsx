
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
  return getCompleteness(item) === 100
    ? "ready"
    : "needs_review";
}

function hasKemenkesDraft(item: UkpEntry) {
  return (
    item.kemenkes_status === "draft_created" ||
    item.kemenkes_status === "sent"
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const [entries, setEntries] = useState<UkpEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("Semua");
  const [pageMessage, setPageMessage] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  // =========================
  // LOGOUT
  // =========================

  async function handleLogout() {
    if (loggingOut) return;

    const confirmed = window.confirm("Yakin ingin logout?");
    if (!confirmed) return;

    setLoggingOut(true);
    setPageMessage("");

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

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
  // MEMUAT DATA UKP
  // =========================

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setPageMessage("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

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

      if (error) {
        throw error;
      }

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
  // MENGHAPUS DATA UKP
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

      if (sessionError) {
        throw sessionError;
      }

      if (!session) {
        throw new Error("Sesi login tidak ditemukan.");
      }

      const { data, error } = await supabase
        .from("ukp")
        .delete()
        .eq("id", entry.id)
        .eq("user_id", session.user.id)
        .select("id");

      if (error) {
        throw error;
      }

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
  // FILTER DAN RINGKASAN
  // =========================

  const filteredEntries = entries.filter((entry) => {
    if (filter === "Semua") return true;
    return getStatus(entry) === filter;
  });

  const jumlahSemua = entries.length;

  const jumlahNeedsReview = entries.filter(
    (entry) => getStatus(entry) === "needs_review"
  ).length;

  const jumlahReady = entries.filter(
    (entry) => getStatus(entry) === "ready"
  ).length;

  // =========================
  // TAMPILAN DASHBOARD
  // =========================

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* HEADER */}

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-teal-600">
              LOGBOOK INTERNSIP
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Dashboard UKP
            </h1>

            <p className="mt-2 text-slate-500">
              Semua data Upaya Kesehatan Perseorangan.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void loadEntries()}
              disabled={loading || loggingOut}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Memuat..." : "🔄 Refresh"}
            </button>

            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loggingOut ? "Logout..." : "↪ Logout"}
            </button>
          </div>
        </div>

        {/* PESAN STATUS */}

        {pageMessage && (
          <div
            role="status"
            className="mb-5 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700"
          >
            {pageMessage}
          </div>
        )}

        {/* KARTU RINGKASAN */}

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

        {/* FILTER */}

        <section className="mt-8 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Semua", value: "Semua" },
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
                onClick={() => setFilter(item.value as Filter)}
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

        {/* DAFTAR DATA */}

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
                Data UKP yang kamu simpan akan muncul di sini.
              </p>
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
      </div>
    </main>
  );
}

// =========================
// KARTU RINGKASAN
// =========================

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value}
      </p>
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
  // KIRIM KE KEMENKES
  // =========================

  async function handleSendToKemenkes() {
    if (sending || alreadyCreated || status !== "ready") {
      return;
    }

    const confirmed = window.confirm(
      "Kirim data ini untuk dibuat sebagai Draft Kemenkes?"
    );

    if (!confirmed) return;

    setSending(true);
    setSyncMessage("");
    setSyncError("");

    try {
      const response = await fetch(
        "/api/kemenkes/ukp/draft",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(entry),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Gagal membuat Draft Kemenkes."
        );
      }

      // Simpan status draft agar tombol terkunci
      // setelah data dimuat kembali dari database.
      const {
        data: updatedRows,
        error: updateError,
      } = await supabase
        .from("ukp")
        .update({
          kemenkes_status: "draft_created",
          kemenkes_draft_created_at:
            new Date().toISOString(),
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
      console.error(
        "Gagal memproses Draft Kemenkes:",
        error
      );

      setSyncError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan."
      );
    } finally {
      setSending(false);
    }
  }

  // =========================
  // HAPUS
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
    <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
              UKP
            </span>

            <StatusBadge status={status} />

            {alreadyCreated && (
              <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                Draft Kemenkes dibuat
              </span>
            )}
          </div>

          <h2 className="mt-3 text-lg font-bold text-slate-900">
            {entry.diagnosis || "Diagnosis belum diisi"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {entry.jenis_tindakan ||
              "Jenis tindakan belum diisi"}
          </p>

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

          <p className="mt-2 text-sm text-slate-400">
            {formatDate(entry.tanggal_pelayanan)}
          </p>

          {/* PROGRESS KELENGKAPAN */}

          <div className="mt-4 max-w-lg">
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
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>

          {/* PESAN BERHASIL */}

          {syncMessage && (
            <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              🟢 {syncMessage}
            </div>
          )}

          {/* PESAN ERROR */}

          {syncError && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              🔴 {syncError}
            </div>
          )}
        </div>

        {/* TOMBOL AKSI */}

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col">
          <button
            type="button"
            onClick={onOpen}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Buka
          </button>

          <button
            type="button"
            onClick={() => void handleSendToKemenkes()}
            disabled={
              status !== "ready" ||
              alreadyCreated ||
              sending
            }
            title={
              alreadyCreated
                ? "Draft Kemenkes sudah dibuat"
                : status !== "ready"
                  ? "Lengkapi data terlebih dahulu"
                  : "Buat Draft Kemenkes"
            }
            className="whitespace-nowrap rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            {sending
              ? "Memproses..."
              : alreadyCreated
                ? "Draft sudah dibuat"
                : status !== "ready"
                  ? "Belum Lengkap"
                  : "Kirim ke Kemenkes"}
          </button>

          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={deleting}
            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? "Menghapus..." : "🗑️ Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================
// BADGE STATUS
// =========================

function StatusBadge({ status }: { status: string }) {
  if (status === "needs_review") {
    return (
      <span className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
        🟠 Needs Review
      </span>
    );
  }

  if (status === "ready") {
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

// =========================
// FORMAT TANGGAL
// =========================

function formatDate(value: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}