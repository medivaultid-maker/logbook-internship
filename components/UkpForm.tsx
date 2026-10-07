"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

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

export default function UkpForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    jenis_tindakan: "",
    no_rekam_medis: "",
    sumber_data: "",
    tanggal_pelayanan: new Date().toISOString().split("T")[0],
    inisial_pasien: "",
    jenis_kelamin: "",
    kategori_pasien: "",
    kategori_kasus: "",
    berat_badan: "",
    tinggi_badan: "",
    anamnesis: "",
    pemeriksaan_fisik: "",
    pemeriksaan_penunjang: "",
    diagnosis_text: "",
    farmakoterapi: "",
    non_farmakoterapi: "",
    monitoring_evaluasi: "",
    diagnosis_banding_text: "",
    status_rujukan: "",
  });

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
      data: {
        user,
      },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage(
        "Belum login. Untuk sementara kita perlu membuat sistem login terlebih dahulu."
      );

      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("ukp_entries")
      .insert({
        user_id: user.id,

        jenis_tindakan: form.jenis_tindakan,
        no_rekam_medis: form.no_rekam_medis,
        sumber_data: form.sumber_data,

        tanggal_pelayanan: form.tanggal_pelayanan,

        inisial_pasien: form.inisial_pasien,
        jenis_kelamin: form.jenis_kelamin,
        kategori_pasien: form.kategori_pasien,
        kategori_kasus: form.kategori_kasus,

        berat_badan: form.berat_badan
          ? Number(form.berat_badan)
          : null,

        tinggi_badan: form.tinggi_badan
          ? Number(form.tinggi_badan)
          : null,

        anamnesis: form.anamnesis,
        pemeriksaan_fisik: form.pemeriksaan_fisik,
        pemeriksaan_penunjang:
          form.pemeriksaan_penunjang,

        diagnosis_text: form.diagnosis_text,

        farmakoterapi: form.farmakoterapi,
        non_farmakoterapi:
          form.non_farmakoterapi,

        monitoring_evaluasi:
          form.monitoring_evaluasi,

        diagnosis_banding_text:
          form.diagnosis_banding_text,

        status_rujukan: form.status_rujukan,

        status: "needs_review",
      });

    if (error) {
      setMessage(
        `Gagal menyimpan: ${error.message}`
      );
    } else {
      setMessage("✅ Data UKP berhasil disimpan.");

      setForm((prev) => ({
        ...prev,

        no_rekam_medis: "",
        inisial_pasien: "",
        berat_badan: "",
        tinggi_badan: "",
        anamnesis: "",
        pemeriksaan_fisik: "",
        pemeriksaan_penunjang: "",
        diagnosis_text: "",
        farmakoterapi: "",
        non_farmakoterapi: "",
        monitoring_evaluasi: "",
        diagnosis_banding_text: "",
      }));
    }

    setLoading(false);
  }

  return (
    <div className="space-y-8">

      {/* DATA PELAYANAN */}

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

        <h2 className="text-lg font-bold">
          Data Pelayanan
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">

          <SelectField
            label="Jenis Tindakan"
            value={form.jenis_tindakan}
            options={jenisTindakan}
            onChange={(value) =>
              updateField("jenis_tindakan", value)
            }
          />

          <SelectField
            label="Sumber Data"
            value={form.sumber_data}
            options={sumberData}
            onChange={(value) =>
              updateField("sumber_data", value)
            }
          />

          <Input
            label="No. Rekam Medis"
            value={form.no_rekam_medis}
            onChange={(value) =>
              updateField("no_rekam_medis", value)
            }
          />

          <Input
            label="Tanggal Pelayanan"
            type="date"
            value={form.tanggal_pelayanan}
            onChange={(value) =>
              updateField("tanggal_pelayanan", value)
            }
          />

        </div>
      </section>


      {/* IDENTITAS PASIEN */}

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

        <h2 className="text-lg font-bold">
          Identitas Pasien
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">

          <Input
            label="Inisial Pasien"
            value={form.inisial_pasien}
            onChange={(value) =>
              updateField("inisial_pasien", value)
            }
          />

          <SelectField
            label="Jenis Kelamin"
            value={form.jenis_kelamin}
            options={[
              "Laki-laki",
              "Perempuan",
            ]}
            onChange={(value) =>
              updateField("jenis_kelamin", value)
            }
          />

          <SelectField
            label="Kategori Pasien"
            value={form.kategori_pasien}
            options={kategoriPasien}
            onChange={(value) =>
              updateField("kategori_pasien", value)
            }
          />

          <SelectField
            label="Kategori Kasus"
            value={form.kategori_kasus}
            options={kategoriKasus}
            onChange={(value) =>
              updateField("kategori_kasus", value)
            }
          />

          <Input
            label="Berat Badan"
            type="number"
            suffix="kg"
            value={form.berat_badan}
            onChange={(value) =>
              updateField("berat_badan", value)
            }
          />

          <Input
            label="Tinggi Badan"
            type="number"
            suffix="cm"
            value={form.tinggi_badan}
            onChange={(value) =>
              updateField("tinggi_badan", value)
            }
          />

        </div>
      </section>


      {/* KLINIS */}

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

        <h2 className="text-lg font-bold">
          Data Klinis
        </h2>

        <div className="mt-5 space-y-5">

          <Textarea
            label="Anamnesis"
            value={form.anamnesis}
            onChange={(value) =>
              updateField("anamnesis", value)
            }
          />

          <Textarea
            label="Pemeriksaan Fisik"
            value={form.pemeriksaan_fisik}
            onChange={(value) =>
              updateField("pemeriksaan_fisik", value)
            }
          />

          <Textarea
            label="Pemeriksaan Penunjang"
            value={form.pemeriksaan_penunjang}
            onChange={(value) =>
              updateField(
                "pemeriksaan_penunjang",
                value
              )
            }
          />

          <Textarea
            label="Diagnosis / Masalah"
            value={form.diagnosis_text}
            onChange={(value) =>
              updateField("diagnosis_text", value)
            }
          />

        </div>

      </section>


      {/* TATALAKSANA */}

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

        <h2 className="text-lg font-bold">
          Tata Laksana
        </h2>

        <div className="mt-5 space-y-5">

          <Textarea
            label="Farmakoterapi"
            value={form.farmakoterapi}
            onChange={(value) =>
              updateField("farmakoterapi", value)
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
            label="Monitoring dan Evaluasi"
            value={form.monitoring_evaluasi}
            onChange={(value) =>
              updateField(
                "monitoring_evaluasi",
                value
              )
            }
          />

          <Textarea
            label="Diagnosis Banding"
            value={form.diagnosis_banding_text}
            onChange={(value) =>
              updateField(
                "diagnosis_banding_text",
                value
              )
            }
          />

        </div>

      </section>


      {/* RUJUKAN */}

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

        <h2 className="text-lg font-bold">
          Rujukan
        </h2>

        <div className="mt-5">

          <SelectField
            label="Status Rujukan"
            value={form.status_rujukan}
            options={[
              "Rujuk",
              "Tidak rujuk",
            ]}
            onChange={(value) =>
              updateField(
                "status_rujukan",
                value
              )
            }
          />

        </div>

      </section>


      {/* SAVE */}

      <section className="flex flex-col gap-4">

        {message && (
          <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm">
            {message}
          </div>
        )}

        <button
          type="button"
          onClick={saveData}
          disabled={loading}
          className="rounded-2xl bg-slate-900 px-6 py-4 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Menyimpan..."
            : "💾 Simpan Data UKP"}
        </button>

      </section>

    </div>
  );
}


/* ======================================================
   COMPONENTS
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
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white"
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
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white"
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
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        rows={5}
        className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white"
      />
    </div>
  );
}