"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const bidangUKM = [
  "Promkes",
  "Kesling",
  "Kesehatan keluarga",
  "Pelayanan gizi",
  "Pelayanan P2P",
  "Penelitian / Evaluasi",
];

export default function UkmForm() {
  const [form, setForm] = useState({
    program: "",
    tipe_kegiatan: "",
    tanggal_pelayanan: new Date().toISOString().split("T")[0],
    judul_laporan: "",
    latar_belakang: "",
    gambaran_pelaksanaan: "",

    mempunyai_jamban_keluarga: false,
    mempunyai_tempat_pembuangan_sampah: false,
    tidak_merokok: false,
    mempunyai_air_bersih: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function updateField(field: string, value: string | boolean) {
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
      setMessage("Sesi login tidak ditemukan.");
      setLoading(false);
      return;
    }

    if (!form.program) {
      setMessage("Pilih bidang UKM terlebih dahulu.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("ukm_entries").insert({
      user_id: user.id,

      program: form.program,
      tipe_kegiatan: form.tipe_kegiatan,

      tanggal_pelayanan: form.tanggal_pelayanan,

      judul_laporan: form.judul_laporan,
      latar_belakang: form.latar_belakang,
      gambaran_pelaksanaan: form.gambaran_pelaksanaan,

      mempunyai_jamban_keluarga:
        form.mempunyai_jamban_keluarga,

      mempunyai_tempat_pembuangan_sampah:
        form.mempunyai_tempat_pembuangan_sampah,

      tidak_merokok:
        form.tidak_merokok,

      mempunyai_air_bersih:
        form.mempunyai_air_bersih,

      status: "needs_review",
    });

    if (error) {
      setMessage(`Gagal menyimpan: ${error.message}`);
    } else {
      setMessage("✅ Data UKM berhasil disimpan.");

      setForm((prev) => ({
        ...prev,
        tipe_kegiatan: "",
        judul_laporan: "",
        latar_belakang: "",
        gambaran_pelaksanaan: "",
        mempunyai_jamban_keluarga: false,
        mempunyai_tempat_pembuangan_sampah: false,
        tidak_merokok: false,
        mempunyai_air_bersih: false,
      }));
    }

    setLoading(false);
  }

  const isKesling = form.program === "Kesling";

  return (
    <div className="space-y-6">

      {/* BIDANG UKM */}

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

        <h2 className="text-lg font-bold">
          Bidang UKM
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Pilih bidang kegiatan yang akan dicatat.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

          {bidangUKM.map((bidang) => (
            <button
              key={bidang}
              type="button"
              onClick={() =>
                updateField("program", bidang)
              }
              className={`rounded-xl border px-4 py-4 text-left transition ${
                form.program === bidang
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-slate-50 hover:bg-white"
              }`}
            >
              <p className="font-semibold">
                {bidang}
              </p>
            </button>
          ))}

        </div>

      </section>


      {/* DATA KEGIATAN */}

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

        <h2 className="text-lg font-bold">
          Data Kegiatan
        </h2>

        <div className="mt-5 space-y-5">

          <div>
            <label className="mb-2 block text-sm font-medium">
              Tanggal pelayanan
            </label>

            <input
              type="date"
              value={form.tanggal_pelayanan}
              onChange={(e) =>
                updateField(
                  "tanggal_pelayanan",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:bg-white"
            />
          </div>


          <div>
            <label className="mb-2 block text-sm font-medium">
              Jenis kegiatan
            </label>

            <input
              type="text"
              value={form.tipe_kegiatan}
              onChange={(e) =>
                updateField(
                  "tipe_kegiatan",
                  e.target.value
                )
              }
              placeholder={
                form.program
                  ? `Jenis kegiatan ${form.program}`
                  : "Pilih bidang terlebih dahulu"
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:bg-white"
            />
          </div>


          <div>
            <label className="mb-2 block text-sm font-medium">
              Judul laporan kegiatan
            </label>

            <input
              type="text"
              value={form.judul_laporan}
              onChange={(e) =>
                updateField(
                  "judul_laporan",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:bg-white"
            />
          </div>


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
            value={form.gambaran_pelaksanaan}
            onChange={(value) =>
              updateField(
                "gambaran_pelaksanaan",
                value
              )
            }
          />

        </div>

      </section>


      {/* KHUSUS KESLING */}

      {isKesling && (
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

          <h2 className="text-lg font-bold">
            Prasyarat Binaan Rumah Sehat
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Centang kondisi yang terpenuhi.
          </p>

          <div className="mt-5 space-y-3">

            <Checkbox
              label="Mempunyai jamban keluarga"
              checked={
                form.mempunyai_jamban_keluarga
              }
              onChange={(value) =>
                updateField(
                  "mempunyai_jamban_keluarga",
                  value
                )
              }
            />

            <Checkbox
              label="Mempunyai tempat pembuangan sampah"
              checked={
                form.mempunyai_tempat_pembuangan_sampah
              }
              onChange={(value) =>
                updateField(
                  "mempunyai_tempat_pembuangan_sampah",
                  value
                )
              }
            />

            <Checkbox
              label="Tidak merokok"
              checked={form.tidak_merokok}
              onChange={(value) =>
                updateField(
                  "tidak_merokok",
                  value
                )
              }
            />

            <Checkbox
              label="Mempunyai air bersih"
              checked={
                form.mempunyai_air_bersih
              }
              onChange={(value) =>
                updateField(
                  "mempunyai_air_bersih",
                  value
                )
              }
            />

          </div>

        </section>
      )}


      {/* SAVE */}

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
            : "💾 Simpan Data UKM"}
        </button>

      </section>

    </div>
  );
}


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
        rows={5}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:bg-white"
      />
    </div>
  );
}


function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50">

      <input
        type="checkbox"
        checked={checked}
        onChange={(e) =>
          onChange(e.target.checked)
        }
        className="h-5 w-5"
      />

      <span className="text-sm font-medium">
        {label}
      </span>

    </label>
  );
}