"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPE DATA UKP
========================================================= */

type UKP = {
  id: string;
  tanggal_pelayanan: string;
  no_rm: string;
  jenis_tindakan: string;
  sumber_data: string;
  jenis_kelamin: string;
  kategori_pasien: string;
  kategori_kasus: string;
  tb: number;
  bb: number;
  anamnesis: string;
  pemeriksaan_fisik: string;
  pemeriksaan_penunjang: string;
  farmakoterapi: string;
  non_farmakoterapi: string;
  monitoring_evaluasi: string;
  status_rujukan: string;
  created_at: string;
  updated_at: string;
  inisial_pasien: string;
};

/* =========================================================
   MASTER DATA
========================================================= */

const jenisTindakan = [
  "Medik",
  "Bedah",
  "Kegawatdaruratan",
  "Kejiwaan",
  "Medikolegal",
  "Kebidanan-Perinatal",
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

/* =========================================================
   PAGE
========================================================= */

export default function UKPPage() {
  /* =======================================================
     DATA DARI SUPABASE
  ======================================================= */

  const [entries, setEntries] = useState<UKP[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [search, setSearch] = useState("");

  /* =======================================================
     FORM
  ======================================================= */

  const [form, setForm] = useState({
    jenis_tindakan: "",
    no_rm: "",
    sumber_data: "",
    tanggal_pelayanan: new Date()
      .toISOString()
      .split("T")[0],

    inisial_pasien: "",
    jenis_kelamin: "",

    kategori_pasien: "",
    kategori_kasus: "",

    tb: "",
    bb: "",

    anamnesis: "",
    pemeriksaan_fisik: "",
    pemeriksaan_penunjang: "",

    farmakoterapi: "",
    non_farmakoterapi: "",

    monitoring_evaluasi: "",

    status_rujukan: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* =======================================================
     AMBIL DATA UKP DARI SUPABASE
  ======================================================= */

  async function loadUKP() {
    setLoadingData(true);

    const { data, error } = await supabase
      .from("ukp")
      .select("*")
      .order("tanggal_pelayanan", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Gagal mengambil data UKP:", error);

      setMessage(
        `Gagal mengambil data UKP: ${error.message}`
      );

      setEntries([]);
    } else {
      setEntries(data ?? []);
    }

    setLoadingData(false);
  }

  /* =======================================================
     LOAD SAAT HALAMAN DIBUKA
  ======================================================= */

  useEffect(() => {
    loadUKP();
  }, []);

  /* =======================================================
     UPDATE FORM
  ======================================================= */

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  /* =======================================================
     SIMPAN DATA DARI DASHBOARD
  ======================================================= */

  async function saveData() {
    setLoading(true);
    setMessage("");

    /* ===============================================
       VALIDASI SEMUA FIELD
    =============================================== */

    const requiredFields = [
      ["Jenis tindakan", form.jenis_tindakan],
      ["No. Rekam Medis", form.no_rm],
      ["Sumber data", form.sumber_data],
      ["Tanggal pelayanan", form.tanggal_pelayanan],
      ["Inisial pasien", form.inisial_pasien],
      ["Jenis kelamin", form.jenis_kelamin],
      ["Kategori pasien", form.kategori_pasien],
      ["Kategori kasus", form.kategori_kasus],
      ["TB", form.tb],
      ["BB", form.bb],
      ["Anamnesis", form.anamnesis],
      ["Pemeriksaan fisik", form.pemeriksaan_fisik],
      [
        "Pemeriksaan penunjang",
        form.pemeriksaan_penunjang,
      ],
      ["Farmakoterapi", form.farmakoterapi],
      [
        "Non-farmakoterapi",
        form.non_farmakoterapi,
      ],
      [
        "Monitoring dan evaluasi",
        form.monitoring_evaluasi,
      ],
      ["Status rujukan", form.status_rujukan],
    ];

    const emptyField = requiredFields.find(
      ([, value]) =>
        !value ||
        String(value).trim() === ""
    );

    if (emptyField) {
      setMessage(
        `⚠️ ${emptyField[0]} wajib diisi.`
      );

      setLoading(false);
      return;
    }

    /* ===============================================
       INSERT KE TABEL ukp
    =============================================== */

    const { error } = await supabase
      .from("ukp")
      .insert({
        tanggal_pelayanan:
          form.tanggal_pelayanan,

        no_rm:
          form.no_rm,

        jenis_tindakan:
          form.jenis_tindakan,

        sumber_data:
          form.sumber_data,

        jenis_kelamin:
          form.jenis_kelamin,

        kategori_pasien:
          form.kategori_pasien,

        kategori_kasus:
          form.kategori_kasus,

        tb:
          Number(form.tb),

        bb:
          Number(form.bb),

        anamnesis:
          form.anamnesis,

        pemeriksaan_fisik:
          form.pemeriksaan_fisik,

        pemeriksaan_penunjang:
          form.pemeriksaan_penunjang,

        farmakoterapi:
          form.farmakoterapi,

        non_farmakoterapi:
          form.non_farmakoterapi,

        monitoring_evaluasi:
          form.monitoring_evaluasi,

        status_rujukan:
          form.status_rujukan,

        inisial_pasien:
          form.inisial_pasien,
      });

    if (error) {
      console.error(
        "Gagal menyimpan UKP:",
        error
      );

      setMessage(
        `❌ Gagal menyimpan: ${error.message}`
      );

      setLoading(false);
      return;
    }

    /* ===============================================
       BERHASIL
    =============================================== */

    setMessage(
      "✅ Data UKP berhasil disimpan."
    );

    /* RESET */

    setForm({
      jenis_tindakan: "",
      no_rm: "",
      sumber_data: "",

      tanggal_pelayanan:
        new Date()
          .toISOString()
          .split("T")[0],

      inisial_pasien: "",
      jenis_kelamin: "",

      kategori_pasien: "",
      kategori_kasus: "",

      tb: "",
      bb: "",

      anamnesis: "",
      pemeriksaan_fisik: "",
      pemeriksaan_penunjang: "",

      farmakoterapi: "",
      non_farmakoterapi: "",

      monitoring_evaluasi: "",

      status_rujukan: "",
    });

    /* REFRESH DATA */

    await loadUKP();

    setLoading(false);
  }

  /* =======================================================
     FILTER SEARCH
  ======================================================= */

  const filteredEntries = entries.filter(
    (entry) => {
      const keyword =
        search.toLowerCase().trim();

      if (!keyword) return true;

      return (
        entry.no_rm
          ?.toLowerCase()
          .includes(keyword) ||
        entry.inisial_pasien
          ?.toLowerCase()
          .includes(keyword) ||
        entry.jenis_tindakan
          ?.toLowerCase()
          .includes(keyword)
      );
    }
  );

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">

          <p className="text-sm font-semibold text-teal-600">
            LOGBOOK INTERNSIP
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            UKP
          </h1>

          <p className="mt-2 text-slate-500">
            Upaya Kesehatan Perseorangan
          </p>

        </div>


        {/* =================================================
            DATA UKP YANG SUDAH TERSIMPAN
        ================================================= */}

        <section className="mb-8 rounded-2xl bg-white p-6 ring-1 ring-slate-200">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-lg font-bold">
                Data UKP
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Data dari Telegram dan dashboard
                tersimpan di tabel <b>ukp</b>.
              </p>
            </div>

            <button
              type="button"
              onClick={loadUKP}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              🔄 Refresh
            </button>

          </div>


          {/* SEARCH */}

          <div className="mt-5">

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="🔎 Cari No. RM, inisial, jenis tindakan..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-teal-400 focus:bg-white"
            />

          </div>


          {/* TABLE */}

          <div className="mt-5 overflow-x-auto">

            {loadingData ? (

              <div className="py-10 text-center text-sm text-slate-500">
                Memuat data UKP...
              </div>

            ) : filteredEntries.length === 0 ? (

              <div className="py-10 text-center text-sm text-slate-500">
                Belum ada data UKP.
              </div>

            ) : (

              <table className="w-full min-w-[1100px] text-sm">

                <thead>

                  <tr className="border-b border-slate-200 text-left">

                    <th className="px-4 py-3 font-semibold">
                      Tanggal
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      No. RM
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Pasien
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Tindakan
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Sumber
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Kategori
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Rujukan
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredEntries.map(
                    (entry) => (

                      <tr
                        key={entry.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >

                        <td className="px-4 py-3">
                          {formatDate(
                            entry.tanggal_pelayanan
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {entry.no_rm}
                        </td>

                        <td className="px-4 py-3">

                          <div className="font-medium">
                            {entry.inisial_pasien}
                          </div>

                          <div className="text-xs text-slate-500">
                            {entry.jenis_kelamin}
                          </div>

                        </td>

                        <td className="px-4 py-3">
                          {entry.jenis_tindakan}
                        </td>

                        <td className="px-4 py-3">
                          {entry.sumber_data}
                        </td>

                        <td className="px-4 py-3">

                          <div>
                            {entry.kategori_pasien}
                          </div>

                          <div className="text-xs text-slate-500">
                            {entry.kategori_kasus}
                          </div>

                        </td>

                        <td className="px-4 py-3">
                          {entry.status_rujukan}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            )}

          </div>


          {/* JUMLAH DATA */}

          {!loadingData && (
            <div className="mt-4 text-sm text-slate-500">
              Menampilkan{" "}
              <b>{filteredEntries.length}</b>{" "}
              dari <b>{entries.length}</b> data UKP.
            </div>
          )}

        </section>


        {/* =================================================
            FORM INPUT
        ================================================= */}

        <div className="space-y-6">

          {/* IDENTITAS */}

          <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">

            <h2 className="text-lg font-bold">
              Input Data UKP
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
                value={form.no_rm}
                onChange={(value) =>
                  updateField(
                    "no_rm",
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
                value={form.bb}
                onChange={(value) =>
                  updateField("bb", value)
                }
              />

              <Input
                label="Tinggi badan"
                suffix="cm"
                type="number"
                value={form.tb}
                onChange={(value) =>
                  updateField("tb", value)
                }
              />

            </div>

          </section>


          {/* DATA KLINIS */}

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

            </div>

          </section>


          {/* RUJUKAN */}

          <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">

            <h2 className="text-lg font-bold">
              Status Rujukan
            </h2>

            <div className="mt-5">

              <SelectField
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

            </div>

          </section>


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
                : "💾 Simpan Data UKP"}
            </button>

          </section>

        </div>

      </div>

    </main>
  );
}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(date: string) {
  if (!date) return "-";

  const parts = date.split("-");

  if (parts.length !== 3) {
    return date;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
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
          required
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
        required
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
        required
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-400 focus:bg-white"
      />

    </div>
  );
}