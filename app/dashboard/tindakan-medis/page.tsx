"use client";

import SearchableMedicalAction from "@/components/SearchableMedicalAction";
import SearchableDiagnosis from "@/components/SearchableDiagnosis";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

const sumberData = [
  "Rawat Darurat",
  "Rawat Inap",
  "Rawat Jalan",
];

const jenisKelamin = [
  "Laki-laki",
  "Perempuan",
];

type Diagnosis = {
  id: string;
  code: string | null;
  name: string;
};

export default function TindakanMedisPage() {
  const [form, setForm] = useState({
    sumber_data: "",
    no_rekam_medis: "",
    inisial_pasien: "",
    jenis_kelamin: "",

    berat_badan: "",
    tinggi_badan: "",

    tanggal_pelayanan: new Date()
      .toISOString()
      .split("T")[0],

    nama_dpjp: "",

    anamnesis: "",

    tindakan_medis: "",

    standar_prosedur_operasional: "",
  });

  // =========================
  // DIAGNOSIS
  // =========================

  const [diagnosis, setDiagnosis] =
    useState<Diagnosis | null>(null);
    const [medicalAction, setMedicalAction] =
  useState<{
    id: string;
    code: string | null;
    name: string;
  } | null>(null);

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

    const { error } = await supabase
      .from("tm_entries")
      .insert({
        user_id: user.id,

        sumber_data: form.sumber_data,
        no_rekam_medis: form.no_rekam_medis,
        inisial_pasien: form.inisial_pasien,
        jenis_kelamin: form.jenis_kelamin,

        berat_badan: form.berat_badan
          ? Number(form.berat_badan)
          : null,

        tinggi_badan: form.tinggi_badan
          ? Number(form.tinggi_badan)
          : null,

        tanggal_pelayanan:
          form.tanggal_pelayanan,

        nama_dpjp: form.nama_dpjp,

        anamnesis: form.anamnesis,

        // Diagnosis dari searchable dropdown
        diagnosis_text:
          diagnosis?.name || "",

        tindakan_medis:
  medicalAction?.name || "",

        standar_prosedur_operasional:
          form.standar_prosedur_operasional,

        status: "needs_review",
      });

    if (error) {
      setMessage(
        `Gagal menyimpan: ${error.message}`
      );
    } else {
      setMessage(
        "✅ Data tindakan medis berhasil disimpan."
      );

      setForm({
        sumber_data: "",
        no_rekam_medis: "",
        inisial_pasien: "",
        jenis_kelamin: "",

        berat_badan: "",
        tinggi_badan: "",

        tanggal_pelayanan: new Date()
          .toISOString()
          .split("T")[0],

        nama_dpjp: "",

        anamnesis: "",

        tindakan_medis: "",

        standar_prosedur_operasional: "",
      });

      // Reset diagnosis
      setDiagnosis(null);
      setMedicalAction(null);
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
            Tindakan Medis
          </h1>

          <p className="mt-2 text-slate-500">
            Lengkapi data kegiatan tindakan medis
            pada pasien.
          </p>

        </div>


        <div className="space-y-6">


          {/* =========================
              DATA PASIEN
          ========================= */}

          <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">

            <h2 className="text-lg font-bold">
              Data Pasien
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">

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
                label="No. Rekam Medis"
                value={form.no_rekam_medis}
                onChange={(value) =>
                  updateField(
                    "no_rekam_medis",
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
                label="Nama dokter penanggung jawab pelayanan (DPJP)"
                value={form.nama_dpjp}
                onChange={(value) =>
                  updateField(
                    "nama_dpjp",
                    value
                  )
                }
              />

            </div>

          </section>


          {/* =========================
              DATA KLINIS
          ========================= */}

          <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">

            <h2 className="text-lg font-bold">
              Data Klinis
            </h2>

            <div className="mt-5 space-y-5">

              {/* ANAMNESIS */}

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


              {/* DIAGNOSIS */}

              <SearchableDiagnosis
                label="Diagnosis / masalah"
                value={diagnosis}
                onChange={setDiagnosis}
                placeholder="🔎 Cari diagnosis ICD-10..."
              />


              {/* TINDAKAN MEDIS */}

             <SearchableMedicalAction
  label="Tindakan medis"
  value={medicalAction}
  onChange={setMedicalAction}
  placeholder="🔎 Cari tindakan medis..."
/>


              {/* SOP */}

              <Textarea
                label="Standar Prosedur Operasional"
                value={
                  form.standar_prosedur_operasional
                }
                onChange={(value) =>
                  updateField(
                    "standar_prosedur_operasional",
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
                : "💾 Simpan Data Tindakan Medis"}
            </button>

          </section>

        </div>

      </div>

    </main>
  );
}


/* ======================================================
   INPUT
====================================================== */

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
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:bg-white ${
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


/* ======================================================
   SELECT
====================================================== */

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
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:bg-white"
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


/* ======================================================
   TEXTAREA
====================================================== */

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
        className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:bg-white"
      />

    </div>
  );
}