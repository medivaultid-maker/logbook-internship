"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const jenisKegiatan = [
  "Advokasi",
  "Kegiatan kemitraan",
  "Kegiatan penyuluhan",
  "Pemberdayaan masyarakat",
];

export default function PromkesPage() {
  const [form, setForm] = useState({
    tanggal_pelayanan: new Date()
      .toISOString()
      .split("T")[0],

    jenis_kegiatan: "",

    judul_laporan: "",

    latar_belakang: "",

    gambaran_pelaksanaan: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function updateField(
    field: string,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function saveData() {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage(
        "Sesi login tidak ditemukan."
      );

      setLoading(false);
      return;
    }

    if (!form.jenis_kegiatan) {
      setMessage(
        "⚠️ Silakan pilih jenis kegiatan terlebih dahulu."
      );

      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("ukm_entries")
      .insert({
        user_id: user.id,

        jenis_ukm: "Promkes",

        jenis_kegiatan:
          form.jenis_kegiatan,

        tanggal_pelayanan:
          form.tanggal_pelayanan,

        judul_laporan:
          form.judul_laporan,

        latar_belakang:
          form.latar_belakang,

        gambaran_pelaksanaan:
          form.gambaran_pelaksanaan,

        status: "needs_review",
      });

    if (error) {
      setMessage(
        `Gagal menyimpan: ${error.message}`
      );
    } else {
      setMessage(
        "✅ Data Promkes berhasil disimpan sebagai draft."
      );

      setForm({
        tanggal_pelayanan: new Date()
          .toISOString()
          .split("T")[0],

        jenis_kegiatan: "",

        judul_laporan: "",

        latar_belakang: "",

        gambaran_pelaksanaan: "",
      });
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* HEADER */}

        <div className="mb-8">

          <p className="text-sm font-semibold text-teal-600">
            LOGBOOK INTERNSIP
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Promkes
          </h1>

          <p className="mt-2 text-slate-500">
            Lengkapi data serangkaian kegiatan
            Promosi Kesehatan.
          </p>

        </div>


        <div className="space-y-6">


          {/* =========================
              DATA KEGIATAN
          ========================= */}

          <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">

            <h2 className="text-lg font-bold">
              Data Kegiatan
            </h2>

            <div className="mt-5 space-y-5">

              <Input
                label="Tanggal pelayanan"
                type="date"
                value={form.tanggal_pelayanan}
                onChange={(value) =>
                  updateField(
                    "tanggal_pelayanan",
                    value
                  )
                }
              />

              <SelectField
                label="Jenis kegiatan"
                value={form.jenis_kegiatan}
                options={jenisKegiatan}
                onChange={(value) =>
                  updateField(
                    "jenis_kegiatan",
                    value
                  )
                }
              />

              <Input
                label="Judul laporan kegiatan"
                value={form.judul_laporan}
                onChange={(value) =>
                  updateField(
                    "judul_laporan",
                    value
                  )
                }
              />

            </div>

          </section>


          {/* =========================
              LAPORAN
          ========================= */}

          <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">

            <h2 className="text-lg font-bold">
              Laporan Kegiatan
            </h2>

            <div className="mt-5 space-y-5">

              <Textarea
                label="Latar belakang"
                value={form.latar_belakang}
                onChange={(value) =>
                  updateField(
                    "latar_belakang",
                    value
                  )
                }
              />

              <Textarea
                label="Gambaran pelaksanaan"
                value={
                  form.gambaran_pelaksanaan
                }
                onChange={(value) =>
                  updateField(
                    "gambaran_pelaksanaan",
                    value
                  )
                }
              />

            </div>

          </section>


          {/* =========================
              SAVE
          ========================= */}

          <section>

            {message && (
              <div className="mb-4 rounded-xl bg-slate-100 px-4 py-3 text-sm">
                {message}
              </div>
            )}

            <button
              type="button"
              onClick={saveData}
              disabled={loading}
              className="w-full rounded-2xl bg-slate-900 px-6 py-4 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {loading
                ? "Menyimpan..."
                : "💾 Simpan Sebagai Draf"}
            </button>

          </section>

        </div>

      </div>

    </main>
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-400 focus:bg-white"
      />

    </div>
  );
}


/* =========================================================
   SELECT
========================================================= */

function SelectField({
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
    <div>

      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-400 focus:bg-white"
      >

        <option value="">
          Pilih {label.toLowerCase()}
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}

      </select>

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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <textarea
        rows={6}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-400 focus:bg-white"
      />

    </div>
  );
}