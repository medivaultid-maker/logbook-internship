
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { ReactNode } from "react";

type UkpForm = {
  jenis_tindakan: string;
  no_rm: string;
  sumber_data: string;
  tanggal_pelayanan: string;
  inisial_pasien: string;
  jenis_kelamin: string;
  kategori_pasien: string;
  kategori_kasus: string;
  bb: string;
  tb: string;
  anamnesis: string;
  pemeriksaan_fisik: string;
  pemeriksaan_penunjang: string;
  diagnosis: string;
  diagnosis_banding: string;
  farmakoterapi: string;
  non_farmakoterapi: string;
  monitoring_evaluasi: string;
  status_rujukan: string;
};

const jenisTindakan = [
  "Medik",
  "Bedah",
  "Kegawatdaruratan",
  "Kejiwaan",
  "Medikolegal",
  "Kebidanan-perinatal",
];

const jenisKelamin = ["Laki-laki", "Perempuan"];

const sumberData = [
  "Rawat Darurat",
  "Rawat Inap",
  "Rawat Jalan",
];

const kategoriPasien = [
  "Bayi-Anak",
  "Dewasa",
  "Lansia",
];

const kategoriKasus = [
  "Non-COVID",
  "Suspect",
  "Probable",
  "Kontak Erat",
  "Konfirmasi",
];

const statusRujukan = ["Rujuk", "Tidak Rujuk"];

const initialForm: UkpForm = {
  jenis_tindakan: "",
  no_rm: "",
  sumber_data: "",
  tanggal_pelayanan: "",
  inisial_pasien: "",
  jenis_kelamin: "",
  kategori_pasien: "",
  kategori_kasus: "",
  bb: "",
  tb: "",
  anamnesis: "",
  pemeriksaan_fisik: "",
  pemeriksaan_penunjang: "",
  diagnosis: "",
  diagnosis_banding: "",
  farmakoterapi: "",
  non_farmakoterapi: "",
  monitoring_evaluasi: "",
  status_rujukan: "",
};

export default function EditUkpPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [form, setForm] = useState<UkpForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  async function loadData() {
    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase
        .from("ukp")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setForm({
        jenis_tindakan: data.jenis_tindakan || "",
        no_rm: data.no_rm || "",
        sumber_data: data.sumber_data || "",
        tanggal_pelayanan: data.tanggal_pelayanan || "",
        inisial_pasien: data.inisial_pasien || "",
        jenis_kelamin: data.jenis_kelamin || "",
        kategori_pasien: data.kategori_pasien || "",
        kategori_kasus: data.kategori_kasus || "",
        bb: data.bb != null ? String(data.bb) : "",
        tb: data.tb != null ? String(data.tb) : "",
        anamnesis: data.anamnesis || "",
        pemeriksaan_fisik: data.pemeriksaan_fisik || "",
        pemeriksaan_penunjang: data.pemeriksaan_penunjang || "",
        diagnosis: data.diagnosis || "",
        diagnosis_banding: data.diagnosis_banding || "",
        farmakoterapi: data.farmakoterapi || "",
        non_farmakoterapi: data.non_farmakoterapi || "",
        monitoring_evaluasi: data.monitoring_evaluasi || "",
        status_rujukan: data.status_rujukan || "",
      });
    } catch (error) {
      console.error("Gagal mengambil data UKP:", error);
      setMessage(
        error instanceof Error
          ? `Gagal mengambil data: ${error.message}`
          : "Gagal mengambil data UKP."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateField(field: keyof UkpForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function saveData() {
    if (saving) return;

    setSaving(true);
    setMessage("");

    try {
      const { error } = await supabase
        .from("ukp")
        .update({
          jenis_tindakan: form.jenis_tindakan,
          no_rm: form.no_rm,
          sumber_data: form.sumber_data,
          tanggal_pelayanan: form.tanggal_pelayanan,
          inisial_pasien: form.inisial_pasien,
          jenis_kelamin: form.jenis_kelamin,
          kategori_pasien: form.kategori_pasien,
          kategori_kasus: form.kategori_kasus,
          bb: form.bb ? Number(form.bb) : null,
          tb: form.tb ? Number(form.tb) : null,
          anamnesis: form.anamnesis,
          pemeriksaan_fisik: form.pemeriksaan_fisik,
          pemeriksaan_penunjang: form.pemeriksaan_penunjang,
          diagnosis: form.diagnosis,
          diagnosis_banding: form.diagnosis_banding,
          farmakoterapi: form.farmakoterapi,
          non_farmakoterapi: form.non_farmakoterapi,
          monitoring_evaluasi: form.monitoring_evaluasi,
          status_rujukan: form.status_rujukan,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      setMessage("success");

      setTimeout(() => {
        router.push(`/dashboard/ukp/${id}`);
      }, 700);
    } catch (error) {
      console.error("Gagal menyimpan perubahan UKP:", error);
      setMessage(
        error instanceof Error
          ? `Gagal menyimpan: ${error.message}`
          : "Gagal menyimpan perubahan UKP."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f5f7fb]">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50">
          <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-teal-100 border-t-teal-600" />
        </div>
        <p className="mt-5 text-sm font-semibold text-slate-700">
          Memuat formulir UKP
        </p>
        <p className="mt-1 text-sm text-slate-400">
          Mohon tunggu sebentar...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">

        {/* BREADCRUMB */}

        <div className="mb-7 flex flex-wrap items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="font-medium text-slate-400 transition hover:text-teal-700"
          >
            Dashboard
          </button>
          <span className="text-slate-300">/</span>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/ukp/${id}`)}
            className="font-medium text-slate-400 transition hover:text-teal-700"
          >
            Detail UKP
          </button>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-700">
            Edit Data
          </span>
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
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-semibold text-white/75">
                MODE EDIT
              </span>
            </div>

            <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Edit Data UKP
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                  Periksa dan perbarui informasi pasien serta dokumentasi
                  klinis sebelum menyimpan perubahan.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-3.5 backdrop-blur-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-300/15 text-xl text-teal-200">
                  ✎
                </div>
                <div>
                  <p className="text-xs text-slate-300">
                    Data yang sedang diedit
                  </p>
                  <p className="mt-1 text-sm font-bold text-white">
                    UKP · {form.inisial_pasien || "Pasien"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FORM */}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void saveData();
          }}
        >
          <Section
            number="01"
            eyebrow="DATA ADMINISTRATIF"
            title="Data Pasien"
            description="Informasi identitas, tanggal pelayanan, dan klasifikasi pasien."
            icon="▤"
          >
            <Select
              label="Jenis tindakan"
              value={form.jenis_tindakan}
              options={jenisTindakan}
              onChange={(v) => updateField("jenis_tindakan", v)}
            />

            <Input
              label="No. Rekam Medis"
              value={form.no_rm}
              onChange={(v) => updateField("no_rm", v)}
            />

            <Select
              label="Sumber Data"
              value={form.sumber_data}
              options={sumberData}
              onChange={(v) => updateField("sumber_data", v)}
            />

            <Input
              label="Tanggal pelayanan"
              type="date"
              value={form.tanggal_pelayanan}
              onChange={(v) => updateField("tanggal_pelayanan", v)}
            />

            <Input
              label="Inisial pasien"
              value={form.inisial_pasien}
              onChange={(v) => updateField("inisial_pasien", v)}
            />

            <Select
              label="Jenis kelamin"
              value={form.jenis_kelamin}
              options={jenisKelamin}
              onChange={(v) => updateField("jenis_kelamin", v)}
            />

            <Select
              label="Kategori pasien"
              value={form.kategori_pasien}
              options={kategoriPasien}
              onChange={(v) => updateField("kategori_pasien", v)}
            />

            <Select
              label="Kategori kasus"
              value={form.kategori_kasus}
              options={kategoriKasus}
              onChange={(v) => updateField("kategori_kasus", v)}
            />

            <Input
              label="Berat badan"
              type="number"
              suffix="kg"
              value={form.bb}
              onChange={(v) => updateField("bb", v)}
            />

            <Input
              label="Tinggi badan"
              type="number"
              suffix="cm"
              value={form.tb}
              onChange={(v) => updateField("tb", v)}
            />

          </Section>

          <Section
            number="02"
            eyebrow="DOKUMENTASI KLINIS"
            title="Data Klinis"
            description="Anamnesis, pemeriksaan, diagnosis, dan tata laksana pasien."
            icon="✚"
          >
            <Textarea
              label="Anamnesis"
              value={form.anamnesis}
              onChange={(v) => updateField("anamnesis", v)}
              placeholder="Masukkan keluhan utama dan riwayat klinis pasien..."
            />

            <Textarea
              label="Pemeriksaan fisik"
              value={form.pemeriksaan_fisik}
              onChange={(v) => updateField("pemeriksaan_fisik", v)}
              placeholder="Masukkan hasil pemeriksaan fisik..."
            />

            <Textarea
              label="Pemeriksaan penunjang"
              value={form.pemeriksaan_penunjang}
              onChange={(v) => updateField("pemeriksaan_penunjang", v)}
              placeholder="Masukkan hasil pemeriksaan penunjang..."
            />

            <Textarea
              label="Diagnosis / masalah"
              value={form.diagnosis}
              onChange={(v) => updateField("diagnosis", v)}
              placeholder="Masukkan diagnosis..."
              accent
            />

            <Textarea
              label="Diagnosis banding"
              value={form.diagnosis_banding}
              onChange={(v) => updateField("diagnosis_banding", v)}
              placeholder="Masukkan diagnosis banding..."
            />

            <Textarea
              label="Farmakoterapi"
              value={form.farmakoterapi}
              onChange={(v) => updateField("farmakoterapi", v)}
              placeholder="Masukkan terapi obat..."
            />

            <Textarea
              label="Non-farmakoterapi"
              value={form.non_farmakoterapi}
              onChange={(v) => updateField("non_farmakoterapi", v)}
              placeholder="Masukkan tata laksana non-obat..."
            />

            <Textarea
              label="Monitoring dan evaluasi"
              value={form.monitoring_evaluasi}
              onChange={(v) => updateField("monitoring_evaluasi", v)}
              placeholder="Masukkan rencana monitoring dan evaluasi..."
            />

            <Select
              label="Status rujukan"
              value={form.status_rujukan}
              options={statusRujukan}
              onChange={(v) => updateField("status_rujukan", v)}
            />
          </Section>

          {/* NOTIFICATION */}

          {message && (
            <div
              role="status"
              className={`mb-5 flex items-start gap-3 rounded-2xl border p-4 text-sm ${
                message === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              <span className="text-base">
                {message === "success" ? "✓" : "!"}
              </span>
              <div>
                <p className="font-bold">
                  {message === "success"
                    ? "Perubahan berhasil disimpan"
                    : "Terjadi kesalahan"}
                </p>
                {message !== "success" && (
                  <p className="mt-1 break-words leading-6">{message}</p>
                )}
                {message === "success" && (
                  <p className="mt-1">
                    Mengarahkan kembali ke halaman detail UKP...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ACTIONS */}

          <section className="mb-6 rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.12)] sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-bold text-slate-900">
                  Simpan perubahan data
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Pastikan seluruh informasi sudah sesuai sebelum menyimpan.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/ukp/${id}`)}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(13,148,136,0.7)] transition hover:-translate-y-0.5 hover:from-teal-800 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        </form>

        <footer className="pb-5 pt-3 text-center">
          <p className="text-xs font-medium tracking-wide text-slate-400">
            LOGBOOK INTERNSIP · UPAYA KESEHATAN PERSEORANGAN
          </p>
        </footer>
      </div>
    </main>
  );
}

/* =========================================================
   SECTION
========================================================= */

function Section({
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
  children: ReactNode;
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

      <div className="grid gap-x-6 gap-y-6 md:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   INPUT
========================================================= */

function Input({
  label,
  value,
  onChange,
  type = "text",
  suffix,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  suffix?: string;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          step={type === "number" ? "any" : undefined}
          className={`w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 ${
            suffix ? "pr-12" : ""
          }`}
        />

        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   SELECT
========================================================= */

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
        >
          <option value="">Pilih {label.toLowerCase()}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
          ▼
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   TEXTAREA
========================================================= */

function Textarea({
  label,
  value,
  onChange,
  placeholder,
  accent = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  accent?: boolean;
}) {
  return (
    <div className="min-w-0 md:col-span-2">
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full resize-y rounded-xl border px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:bg-white focus:ring-4 ${
          accent
            ? "border-teal-200 bg-teal-50/40 focus:border-teal-500 focus:ring-teal-500/10"
            : "border-slate-200 bg-[#f8fafc] focus:border-teal-500 focus:ring-teal-500/10"
        }`}
      />
    </div>
  );
}
