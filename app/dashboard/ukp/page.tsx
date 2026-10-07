"use client";

import SearchableDiagnosis from "@/components/SearchableDiagnosis";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

/* =========================================================
   MASTER DATA UKP
========================================================= */

const jenisTindakan = [
  "Medik",
  "Bedah",
  "Kegawatdaruratan",
  "Kejiwaan",
  "Medikolegal",
  "Kebidanan-perinatal",
];

const sumberData = [
  "Rawat Darurat",
  "Rawat Inap",
  "Rawat Jalan",
];

const jenisKelamin = [
  "Laki-laki",
  "Perempuan",
];

const kategoriPasien = [
  "Bayi-Anak",
  "Dewasa",
  "Lansia",
];

const kategoriKasus = [
  "Non-Covid",
  "Suspect",
  "Probable",
  "Kontak Erat",
  "Konfirmasi",
];

const statusRujukan = [
  "Rujuk",
  "Tidak rujuk",
];

/* =========================================================
   PAGE
========================================================= */

export default function UKPPage() {

  const [form, setForm] = useState({
    jenis_tindakan: "",
    no_rekam_medis: "",
    sumber_data: "",
    tanggal_pelayanan: new Date()
      .toISOString()
      .split("T")[0],

    inisial_pasien: "",
    jenis_kelamin: "",

    kategori_pasien: "",
    kategori_kasus: "",

    berat_badan: "",
    tinggi_badan: "",

    anamnesis: "",
    pemeriksaan_fisik: "",
    pemeriksaan_penunjang: "",

    tata_laksana: "",

    farmakoterapi: "",
    non_farmakoterapi: "",

    monitoring_evaluasi: "",

    status_rujukan: "",
  });

  const [diagnosis, setDiagnosis] = useState<{
    id: string;
    code: string | null;
    name: string;
  } | null>(null);

  const [diagnosisBanding, setDiagnosisBanding] =
    useState<{
      id: string;
      code: string | null;
      name: string;
    } | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* =========================================================
     UPDATE FIELD
  ========================================================= */

  function updateField(
    field: string,
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

    if (!diagnosis) {
      setMessage(
        "⚠️ Silakan pilih Diagnosis / masalah terlebih dahulu."
      );

      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("ukp_entries")
      .insert({

        user_id: user.id,

        jenis_tindakan:
          form.jenis_tindakan,

        no_rekam_medis:
          form.no_rekam_medis,

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

        berat_badan:
          form.berat_badan
            ? Number(form.berat_badan)
            : null,

        tinggi_badan:
          form.tinggi_badan
            ? Number(form.tinggi_badan)
            : null,

        anamnesis:
          form.anamnesis,

        pemeriksaan_fisik:
          form.pemeriksaan_fisik,

        pemeriksaan_penunjang:
          form.pemeriksaan_penunjang,

        diagnosis_id:
          diagnosis.id,

        diagnosis_code:
          diagnosis.code,

        diagnosis_name:
          diagnosis.name,

        tata_laksana:
          form.tata_laksana,

        farmakoterapi:
          form.farmakoterapi,

        non_farmakoterapi:
          form.non_farmakoterapi,

        monitoring_evaluasi:
          form.monitoring_evaluasi,

        diagnosis_banding_id:
          diagnosisBanding?.id ?? null,

        diagnosis_banding_code:
          diagnosisBanding?.code ?? null,

        diagnosis_banding_name:
          diagnosisBanding?.name ?? null,

        status_rujukan:
          form.status_rujukan,

        status: "needs_review",
      });

    if (error) {

      setMessage(
        `Gagal menyimpan: ${error.message}`
      );

    } else {

      setMessage(
        "✅ Data UKP berhasil disimpan."
      );

      /* RESET */

      setForm({
        jenis_tindakan: "",
        no_rekam_medis: "",
        sumber_data: "",

        tanggal_pelayanan:
          new Date()
            .toISOString()
            .split("T")[0],

        inisial_pasien: "",
        jenis_kelamin: "",

        kategori_pasien: "",
        kategori_kasus: "",

        berat_badan: "",
        tinggi_badan: "",

        anamnesis: "",
        pemeriksaan_fisik: "",
        pemeriksaan_penunjang: "",

        tata_laksana: "",

        farmakoterapi: "",
        non_farmakoterapi: "",

        monitoring_evaluasi: "",

        status_rujukan: "",
      });

      setDiagnosis(null);
      setDiagnosisBanding(null);
    }

    setLoading(false);
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* HEADER */}

        <div className="mb-8">

          <p className="text-sm font-semibold text-teal-600">
            LOGBOOK INTERNSIP
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            UKP
          </h1>

          <p className="mt-2 text-slate-500">
            Lengkapi data serangkaian kegiatan
            Upaya Kesehatan Perseorangan (UKP).
          </p>

        </div>


        <div className="space-y-6">


          {/* =================================================
              IDENTITAS PELAYANAN
          ================================================= */}

          <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">

            <h2 className="text-lg font-bold">
              Identitas Pelayanan
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">

              <SelectField
                label="Jenis Tindakan"
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
                value={form.no_rekam_medis}
                onChange={(value) =>
                  updateField(
                    "no_rekam_medis",
                    value
                  )
                }
              />

              <SelectField
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

              <SelectField
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

              <SelectField
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

              <SelectField
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
                suffix="kg"
                type="number"
                value={form.berat_badan}
                onChange={(value) =>
                  updateField(
                    "berat_badan",
                    value
                  )
                }
              />

              <Input
                label="Tinggi badan"
                suffix="cm"
                type="number"
                value={form.tinggi_badan}
                onChange={(value) =>
                  updateField(
                    "tinggi_badan",
                    value
                  )
                }
              />

            </div>

          </section>


          {/* =================================================
              DATA KLINIS
          ================================================= */}

          <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">

            <h2 className="text-lg font-bold">
              Data Klinis
            </h2>

            <div className="mt-5 space-y-5">


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


              {/* DIAGNOSIS */}

              <SearchableDiagnosis
                label="Diagnosis / masalah"
                value={diagnosis}
                onChange={setDiagnosis}
                placeholder="🔎 Cari diagnosis ICD-10..."
              />


              {/* TATA LAKSANA */}

              <Textarea
                label="Tata laksana"
                value={form.tata_laksana}
                onChange={(value) =>
                  updateField(
                    "tata_laksana",
                    value
                  )
                }
              />


              {/* FARMako */}

              <Textarea
                label="Farmakoterapi"
                value={form.farmakoterapi}
                onChange={(value) =>
                  updateField(
                    "farmakoterapi",
                    value
                  )
                }
                placeholder="Contoh: Paracetamol 500 mg 3x1"
              />


              {/* NON FARMAKO */}

              <Textarea
                label="Non-Farmakoterapi"
                value={
                  form.non_farmakoterapi
                }
                onChange={(value) =>
                  updateField(
                    "non_farmakoterapi",
                    value
                  )
                }
              />


              {/* MONITORING */}

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


              {/* DIAGNOSIS BANDING */}

              <SearchableDiagnosis
                label="Diagnosis Banding"
                value={diagnosisBanding}
                onChange={setDiagnosisBanding}
                placeholder="🔎 Cari diagnosis banding ICD-10..."
              />

            </div>

          </section>


          {/* =================================================
              RUJUKAN
          ================================================= */}

          <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">

            <h2 className="text-lg font-bold">
              Status Rujukan
            </h2>

            <div className="mt-5">

              <SelectField
                label="Status rujukan (sesuai level kompetensi SKDI)"
                value={form.status_rujukan}
                options={statusRujukan}
                onChange={(value) =>
                  updateField(
                    "status_rujukan",
                    value
                  )
                }
              />

            </div>

          </section>


          {/* =================================================
              SAVE
          ================================================= */}

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
                : "💾 Simpan Data UKP"}

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

      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <div className="relative">

        <input
          type={type}
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-400 focus:bg-white ${
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
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {

  return (
    <div>

      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <textarea
        rows={5}
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-400 focus:bg-white"
      />

    </div>
  );
}