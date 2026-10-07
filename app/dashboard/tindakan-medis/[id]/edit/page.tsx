"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type TmForm = {
  sumber_data: string;
  no_rekam_medis: string;
  inisial_pasien: string;
  jenis_kelamin: string;

  berat_badan: string;
  tinggi_badan: string;

  tanggal_pelayanan: string;

  nama_dpjp: string;

  anamnesis: string;
  diagnosis_text: string;
  tindakan_medis: string;
  standar_prosedur_operasional: string;
};

const sumberData = [
  "Rawat Darurat",
  "Rawat Inap",
  "Rawat Jalan",
];

const jenisKelamin = [
  "Laki-laki",
  "Perempuan",
];

export default function EditTindakanMedisPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [form, setForm] = useState<TmForm>({
    sumber_data: "",
    no_rekam_medis: "",
    inisial_pasien: "",
    jenis_kelamin: "",

    berat_badan: "",
    tinggi_badan: "",

    tanggal_pelayanan: "",

    nama_dpjp: "",

    anamnesis: "",
    diagnosis_text: "",
    tindakan_medis: "",
    standar_prosedur_operasional: "",
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
      .from("tm_entries")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setForm({
      sumber_data: data.sumber_data || "",

      no_rekam_medis:
        data.no_rekam_medis || "",

      inisial_pasien:
        data.inisial_pasien || "",

      jenis_kelamin:
        data.jenis_kelamin || "",

      berat_badan:
        data.berat_badan !== null
          ? String(data.berat_badan)
          : "",

      tinggi_badan:
        data.tinggi_badan !== null
          ? String(data.tinggi_badan)
          : "",

      tanggal_pelayanan:
        data.tanggal_pelayanan || "",

      nama_dpjp:
        data.nama_dpjp || "",

      anamnesis:
        data.anamnesis || "",

      diagnosis_text:
        data.diagnosis_text || "",

      tindakan_medis:
        data.tindakan_medis || "",

      standar_prosedur_operasional:
        data.standar_prosedur_operasional || "",
    });

    setLoading(false);
  }

  function updateField(
    field: keyof TmForm,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function getTmStatus() {
  const required = [
    form.sumber_data,
    form.no_rekam_medis,
    form.inisial_pasien,
    form.jenis_kelamin,
    form.tanggal_pelayanan,
    form.nama_dpjp,
    form.anamnesis,
    form.diagnosis_text,
    form.tindakan_medis,
    form.standar_prosedur_operasional,
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

    const { error } = await supabase
      .from("tm_entries")
      .update({
        sumber_data:
          form.sumber_data,

        no_rekam_medis:
          form.no_rekam_medis,

        inisial_pasien:
          form.inisial_pasien,

        jenis_kelamin:
          form.jenis_kelamin,

        berat_badan:
          form.berat_badan
            ? Number(form.berat_badan)
            : null,

        tinggi_badan:
          form.tinggi_badan
            ? Number(form.tinggi_badan)
            : null,

        tanggal_pelayanan:
          form.tanggal_pelayanan,

        nama_dpjp:
          form.nama_dpjp,

        anamnesis:
          form.anamnesis,

        diagnosis_text:
          form.diagnosis_text,

        tindakan_medis:
          form.tindakan_medis,

        standar_prosedur_operasional:
          form.standar_prosedur_operasional,

        status: getTmStatus(),
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

    setMessage(
      "✅ Data tindakan medis berhasil diperbarui."
    );

    setTimeout(() => {
      router.push(
        `/dashboard/tindakan-medis/${id}`
      );
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
            router.push(
              `/dashboard/tindakan-medis/${id}`
            )
          }
          className="mb-6 text-sm font-semibold text-slate-500 hover:text-slate-900"
        >
          ← Kembali ke Detail Tindakan Medis
        </button>


        {/* HEADER */}

        <div className="mb-8">

          <p className="text-sm font-semibold text-teal-600">
            LOGBOOK INTERNSIP
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Edit Tindakan Medis
          </h1>

          <p className="mt-2 text-slate-500">
            Periksa dan perbarui data tindakan
            medis sebelum digunakan sebagai draft.
          </p>

        </div>


        {/* DATA PASIEN */}

        <Section title="Data Pasien">

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

          <Input
            label="Berat badan"
            type="number"
            suffix="kg"
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
            type="number"
            suffix="cm"
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

        </Section>


        {/* DATA KLINIS */}

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
            label="Diagnosis / masalah"
            value={form.diagnosis_text}
            onChange={(value) =>
              updateField(
                "diagnosis_text",
                value
              )
            }
          />

          <Textarea
            label="Tindakan medis"
            value={form.tindakan_medis}
            onChange={(value) =>
              updateField(
                "tindakan_medis",
                value
              )
            }
          />

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

        </Section>


        {/* MESSAGE */}

        {message && (
          <div className="mb-4 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-900">
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
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:bg-white ${
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
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:bg-white"
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
        className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:bg-white"
      />

    </div>
  );
}