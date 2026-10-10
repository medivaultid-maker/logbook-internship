"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

const jenisKelamin = [
  "Laki-laki",
  "Perempuan",
];

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

const statusRujukan = [
  "Rujuk",
  "Tidak Rujuk",
];

export default function EditUkpPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [form, setForm] = useState<UkpForm>({
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
  });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    if (!id) return;

    loadData();
  }, [id]);

  async function loadData() {
    setLoading(true);
    setMessage("");

    const { data, error } =
      await supabase
        .from("ukp")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
      console.error(
        "Gagal mengambil data UKP:",
        error
      );

      setMessage(error.message);
      setLoading(false);
      return;
    }

    setForm({
      jenis_tindakan:
        data.jenis_tindakan || "",

      no_rm:
        data.no_rm || "",

      sumber_data:
        data.sumber_data || "",

      tanggal_pelayanan:
        data.tanggal_pelayanan || "",

      inisial_pasien:
        data.inisial_pasien || "",

      jenis_kelamin:
        data.jenis_kelamin || "",

      kategori_pasien:
        data.kategori_pasien || "",

      kategori_kasus:
        data.kategori_kasus || "",

      bb:
        data.bb !== null &&
        data.bb !== undefined
          ? String(data.bb)
          : "",

      tb:
        data.tb !== null &&
        data.tb !== undefined
          ? String(data.tb)
          : "",

      anamnesis:
        data.anamnesis || "",

      pemeriksaan_fisik:
        data.pemeriksaan_fisik || "",

      pemeriksaan_penunjang:
        data.pemeriksaan_penunjang || "",

      diagnosis:
        data.diagnosis || "",

      diagnosis_banding:
        data.diagnosis_banding || "",

      farmakoterapi:
        data.farmakoterapi || "",

      non_farmakoterapi:
        data.non_farmakoterapi || "",

      monitoring_evaluasi:
        data.monitoring_evaluasi || "",

      status_rujukan:
        data.status_rujukan || "",
    });

    setLoading(false);
  }

  /* =========================================================
     UPDATE FIELD
  ========================================================= */

  function updateField(
    field: keyof UkpForm,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  /* =========================================================
     SAVE
  ========================================================= */

  async function saveData() {
    setSaving(true);
    setMessage("");

    const { error } =
      await supabase
        .from("ukp")
        .update({

          jenis_tindakan:
            form.jenis_tindakan,

          no_rm:
            form.no_rm,

          sumber_data:
            form.sumber_data,

          tanggal_pelayanan:
            form.tanggal_pelayanan,

          inisial_pasien:
            form.inisial_pasien,

          jenis_kelamin:
            form.jenis_kelamin,

          kategori_pasien:
            form.kategori_pasien,

          kategori_kasus:
            form.kategori_kasus,

          bb:
            form.bb
              ? Number(form.bb)
              : null,

          tb:
            form.tb
              ? Number(form.tb)
              : null,

          anamnesis:
            form.anamnesis,

          pemeriksaan_fisik:
            form.pemeriksaan_fisik,

          pemeriksaan_penunjang:
            form.pemeriksaan_penunjang,

          diagnosis:
            form.diagnosis,

          diagnosis_banding:
            form.diagnosis_banding,

          farmakoterapi:
            form.farmakoterapi,

          non_farmakoterapi:
            form.non_farmakoterapi,

          monitoring_evaluasi:
            form.monitoring_evaluasi,

          status_rujukan:
            form.status_rujukan,

          updated_at:
            new Date().toISOString(),

        })
        .eq("id", id);

    if (error) {

      console.error(
        "Gagal menyimpan perubahan UKP:",
        error
      );

      setMessage(
        `❌ Gagal menyimpan: ${error.message}`
      );

      setSaving(false);
      return;
    }

    setMessage(
      "✅ Data UKP berhasil diperbarui."
    );

    setTimeout(() => {
      router.push(
        `/dashboard/ukp/${id}`
      );
    }, 700);

    setSaving(false);
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-10">

        <div className="mx-auto max-w-4xl text-center text-slate-500">
          Memuat data UKP...
        </div>

      </main>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-4xl px-6 py-10">

        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            router.push(
              `/dashboard/ukp/${id}`
            )
          }
          className="mb-6 text-sm font-semibold text-slate-500 hover:text-slate-900"
        >
          ← Kembali ke Detail UKP
        </button>


        {/* HEADER */}

        <div className="mb-8">

          <p className="text-sm font-semibold text-teal-600">
            LOGBOOK INTERNSIP
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Edit Data UKP
          </h1>

          <p className="mt-2 text-slate-500">
            Periksa dan perbarui data UKP.
          </p>

        </div>


        {/* =================================================
            DATA PASIEN
        ================================================= */}

        <Section title="Data Pasien">

          <Select
            label="Jenis tindakan"
            value={form.jenis_tindakan}
            options={jenisTindakan}
            onChange={(value) =>
              updateField(
                "jenis_tindakan",
                value
              )
            }
          />

          <Input
            label="No. Rekam Medis"
            value={form.no_rm}
            onChange={(value) =>
              updateField(
                "no_rm",
                value
              )
            }
          />

          <Select
            label="Sumber Data"
            value={form.sumber_data}
            options={sumberData}
            onChange={(value) =>
              updateField(
                "sumber_data",
                value
              )
            }
          />

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
            label="Inisial pasien"
            value={form.inisial_pasien}
            onChange={(value) =>
              updateField(
                "inisial_pasien",
                value
              )
            }
          />

          <Select
            label="Jenis kelamin"
            value={form.jenis_kelamin}
            options={jenisKelamin}
            onChange={(value) =>
              updateField(
                "jenis_kelamin",
                value
              )
            }
          />

          <Select
            label="Kategori pasien"
            value={form.kategori_pasien}
            options={kategoriPasien}
            onChange={(value) =>
              updateField(
                "kategori_pasien",
                value
              )
            }
          />

          <Select
            label="Kategori kasus"
            value={form.kategori_kasus}
            options={kategoriKasus}
            onChange={(value) =>
              updateField(
                "kategori_kasus",
                value
              )
            }
          />

          <Input
            label="Berat badan"
            type="number"
            suffix="kg"
            value={form.bb}
            onChange={(value) =>
              updateField(
                "bb",
                value
              )
            }
          />

          <Input
            label="Tinggi badan"
            type="number"
            suffix="cm"
            value={form.tb}
            onChange={(value) =>
              updateField(
                "tb",
                value
              )
            }
          />

        </Section>


        {/* =================================================
            DATA KLINIS
        ================================================= */}

        <Section title="Data Klinis">

          <Textarea
            label="Anamnesis"
            value={form.anamnesis}
            onChange={(value) =>
              updateField(
                "anamnesis",
                value
              )
            }
          />

          <Textarea
            label="Pemeriksaan fisik"
            value={form.pemeriksaan_fisik}
            onChange={(value) =>
              updateField(
                "pemeriksaan_fisik",
                value
              )
            }
          />

          <Textarea
            label="Pemeriksaan penunjang"
            value={
              form.pemeriksaan_penunjang
            }
            onChange={(value) =>
              updateField(
                "pemeriksaan_penunjang",
                value
              )
            }
          />

          <Textarea
            label="Diagnosis / masalah"
            value={form.diagnosis}
            onChange={(value) =>
              updateField(
                "diagnosis",
                value
              )
            }
          />

          <Textarea
            label="Diagnosis Banding"
            value={form.diagnosis_banding}
            onChange={(value) =>
              updateField(
                "diagnosis_banding",
                value
              )
            }
          />

          <Textarea
            label="Farmakoterapi"
            value={form.farmakoterapi}
            onChange={(value) =>
              updateField(
                "farmakoterapi",
                value
              )
            }
          />

          <Textarea
            label="Non-Farmakoterapi"
            value={form.non_farmakoterapi}
            onChange={(value) =>
              updateField(
                "non_farmakoterapi",
                value
              )
            }
          />

          <Textarea
            label="Monitoring dan evaluasi"
            value={
              form.monitoring_evaluasi
            }
            onChange={(value) =>
              updateField(
                "monitoring_evaluasi",
                value
              )
            }
          />

          <Select
            label="Status rujukan"
            value={form.status_rujukan}
            options={statusRujukan}
            onChange={(value) =>
              updateField(
                "status_rujukan",
                value
              )
            }
          />

        </Section>


        {/* MESSAGE */}

        {message && (
          <div className="mb-4 rounded-xl bg-slate-100 px-4 py-3 text-sm">
            {message}
          </div>
        )}


        {/* SAVE */}

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
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-900">
        {label}
      </label>

      <div className="relative">

        <input
          type={type}
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-400 focus:bg-white ${
            suffix ? "pr-12" : ""
          }`}
        />

        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
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
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-900">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-400 focus:bg-white"
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
    <div className="md:col-span-2">

      <label className="mb-2 block text-sm font-medium text-slate-900">
        {label}
      </label>

      <textarea
        rows={5}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-400 focus:bg-white"
      />

    </div>
  );
}