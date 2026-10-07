"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type UkmForm = {
  program: string;
  tipe_kegiatan: string;
  tanggal_pelayanan: string;
  judul_laporan: string;
  latar_belakang: string;
  gambaran_pelaksanaan: string;

  mempunyai_jamban_keluarga: boolean;
  mempunyai_tempat_pembuangan_sampah: boolean;
  tidak_merokok: boolean;
  mempunyai_air_bersih: boolean;

  prasyarat_binaan: string[];
};

const bidangUKM = [
  "Promkes",
  "Kesling",
  "Kesehatan keluarga",
  "Pelayanan gizi",
  "Pelayanan P2P",
  "Penelitian / Evaluasi",
];

const prasyaratKesling = [
  "Mempunyai jamban keluarga",
  "Mempunyai tempat pembuangan sampah",
  "Tidak merokok",
  "Mempunyai air bersih",
];

export default function EditUkmPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [form, setForm] = useState<UkmForm>({
    program: "",
    tipe_kegiatan: "",
    tanggal_pelayanan: "",
    judul_laporan: "",
    latar_belakang: "",
    gambaran_pelaksanaan: "",

    mempunyai_jamban_keluarga: false,
    mempunyai_tempat_pembuangan_sampah: false,
    tidak_merokok: false,
    mempunyai_air_bersih: false,

    prasyarat_binaan: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
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

    const { data, error } = await supabase
      .from("ukm_entries")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const prasyarat = Array.isArray(data.prasyarat_binaan)
      ? data.prasyarat_binaan
      : [];

    setForm({
      program: data.program || "",

      tipe_kegiatan:
        data.tipe_kegiatan || "",

      tanggal_pelayanan:
        data.tanggal_pelayanan || "",

      judul_laporan:
        data.judul_laporan || "",

      latar_belakang:
        data.latar_belakang || "",

      gambaran_pelaksanaan:
        data.gambaran_pelaksanaan || "",

      mempunyai_jamban_keluarga:
        Boolean(data.mempunyai_jamban_keluarga),

      mempunyai_tempat_pembuangan_sampah:
        Boolean(
          data.mempunyai_tempat_pembuangan_sampah
        ),

      tidak_merokok:
        Boolean(data.tidak_merokok),

      mempunyai_air_bersih:
        Boolean(data.mempunyai_air_bersih),

      prasyarat_binaan: prasyarat,
    });

    setLoading(false);
  }

  function updateField(
    field: keyof UkmForm,
    value: string | boolean | string[]
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function togglePrasyarat(label: string) {
    setForm((prev) => {
      const exists =
        prev.prasyarat_binaan.includes(label);

      return {
        ...prev,
        prasyarat_binaan: exists
          ? prev.prasyarat_binaan.filter(
              (item) => item !== label
            )
          : [...prev.prasyarat_binaan, label],
      };
    });
  }

  function getUkmStatus() {
  const required = [
    form.program,
    form.tipe_kegiatan,
    form.tanggal_pelayanan,
    form.judul_laporan,
    form.latar_belakang,
    form.gambaran_pelaksanaan,
  ];

  return required.every(
    (value) => value.trim() !== ""
  )
    ? "ready"
    : "needs_review";
}

  async function saveData() {
    setSaving(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Sesi login tidak ditemukan.");
      setSaving(false);
      return;
    }

    if (!form.program) {
      setMessage("Pilih bidang UKM terlebih dahulu.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("ukm_entries")
      .update({
        program: form.program,

        tipe_kegiatan:
          form.tipe_kegiatan,

        tanggal_pelayanan:
          form.tanggal_pelayanan,

        judul_laporan:
          form.judul_laporan,

        latar_belakang:
          form.latar_belakang,

        gambaran_pelaksanaan:
          form.gambaran_pelaksanaan,

        mempunyai_jamban_keluarga:
          form.mempunyai_jamban_keluarga,

        mempunyai_tempat_pembuangan_sampah:
          form.mempunyai_tempat_pembuangan_sampah,

        tidak_merokok:
          form.tidak_merokok,

        mempunyai_air_bersih:
          form.mempunyai_air_bersih,

        prasyarat_binaan:
          form.prasyarat_binaan,

        status: getUkmStatus(),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      setMessage(
        `Gagal menyimpan: ${error.message}`
      );
      setSaving(false);
      return;
    }

    setMessage("✅ Data UKM berhasil diperbarui.");

    setTimeout(() => {
      router.push(`/dashboard/ukm/${id}`);
    }, 700);

    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-10">
        <div className="mx-auto max-w-4xl text-center text-slate-500">
          Memuat data...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-4xl px-6 py-10">

        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            router.push(`/dashboard/ukm/${id}`)
          }
          className="mb-6 text-sm font-semibold text-slate-500 hover:text-slate-900"
        >
          ← Kembali ke Detail UKM
        </button>


        {/* HEADER */}

        <div className="mb-8">

          <p className="text-sm font-semibold text-teal-600">
            LOGBOOK INTERNSIP
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Edit Data UKM
          </h1>

          <p className="mt-2 text-slate-500">
            Periksa dan perbarui data kegiatan
            sebelum digunakan sebagai draft.
          </p>

        </div>


        {/* BIDANG UKM */}

        <section className="mb-6 rounded-2xl bg-white p-6 ring-1 ring-slate-200">

          <h2 className="text-lg font-bold text-slate-900">
            Bidang UKM
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

            {bidangUKM.map((bidang) => (
              <button
                key={bidang}
                type="button"
                onClick={() =>
                  updateField(
                    "program",
                    bidang
                  )
                }
                className={`rounded-xl border px-4 py-4 text-left transition ${
                  form.program === bidang
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-900 hover:bg-white"
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

        <section className="mb-6 rounded-2xl bg-white p-6 ring-1 ring-slate-200">

          <h2 className="text-lg font-bold text-slate-900">
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

            <Input
              label="Jenis kegiatan"
              value={form.tipe_kegiatan}
              onChange={(value) =>
                updateField(
                  "tipe_kegiatan",
                  value
                )
              }
              placeholder={
                form.program
                  ? `Jenis kegiatan ${form.program}`
                  : "Pilih bidang terlebih dahulu"
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


        {/* KESLING */}

        {form.program === "Kesling" && (
          <section className="mb-6 rounded-2xl bg-white p-6 ring-1 ring-slate-200">

            <h2 className="text-lg font-bold text-slate-900">
              Prasyarat Binaan Rumah Sehat
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Centang kondisi yang terpenuhi.
            </p>

            <div className="mt-5 space-y-3">

              {prasyaratKesling.map((item) => (
                <label
                  key={item}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50"
                >

                  <input
                    type="checkbox"
                    checked={form.prasyarat_binaan.includes(
                      item
                    )}
                    onChange={() =>
                      togglePrasyarat(item)
                    }
                    className="h-5 w-5"
                  />

                  <span className="text-sm font-medium text-slate-900">
                    {item}
                  </span>

                </label>
              ))}

            </div>

          </section>
        )}


        {/* SAVE */}

        {message && (
          <div className="mb-4 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-900">
            {message}
          </div>
        )}

        <button
          type="button"
          onClick={saveData}
          disabled={saving}
          className="w-full rounded-2xl bg-slate-900 px-6 py-4 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {saving
            ? "Menyimpan..."
            : "💾 Simpan Perubahan"}
        </button>

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
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-900">
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white"
      />

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

      <label className="mb-2 block text-sm font-medium text-slate-900">
        {label}
      </label>

      <textarea
        rows={5}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white"
      />

    </div>
  );
}