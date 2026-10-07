"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestWhatsAppPage() {
  const [message, setMessage] = useState(`TM

Tanggal: 04/10/2026
Sumber data: Rawat Jalan
RM: 789012
Inisial: CD
JK: Perempuan
BB: 55
TB: 160
DPJP: dr. Contoh

Anamnesis:
Pasien datang dengan keluhan demam sejak 2 hari.

Diagnosis:
Demam

Tindakan medis:
Pemeriksaan tanda vital dan pemeriksaan fisik lengkap.

Standar Prosedur Operasional:
Melakukan pemeriksaan sesuai SOP pelayanan pasien.`);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  async function sendMessage() {
    setLoading(true);
    setResult("");

    try {
      // ==========================================
      // AMBIL USER LOGIN
      // ==========================================

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        setResult(
          `❌ Gagal membaca user:\n${userError.message}`
        );
        setLoading(false);
        return;
      }

      if (!user) {
        setResult(
          "❌ User login tidak ditemukan. Silakan login terlebih dahulu."
        );
        setLoading(false);
        return;
      }

      // ==========================================
      // AMBIL SESSION
      // ==========================================

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setResult(
          "❌ Session login tidak ditemukan."
        );
        setLoading(false);
        return;
      }

      // ==========================================
      // KIRIM KE WEBHOOK
      // ==========================================

      const response = await fetch(
        "/api/whatsapp/webhook",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Authorization:
              `Bearer ${session.access_token}`,
          },

          body: JSON.stringify({
            user_id: user.id,

            message: {
              text: message,
            },
          }),
        }
      );

      // ==========================================
      // HASIL
      // ==========================================

      const data =
        await response.json();

      setResult(
        JSON.stringify(
          data,
          null,
          2
        )
      );

    } catch (error) {

      setResult(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan."
      );

    } finally {

      setLoading(false);

    }
  }

  return (
    <main className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-4xl px-6 py-10">

        {/* HEADER */}

        <div className="mb-8">

          <p className="text-sm font-semibold text-teal-600">
            DEVELOPMENT
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Test WhatsApp
          </h1>

          <p className="mt-2 text-slate-500">
            Simulasikan pesan WhatsApp
            sebelum menghubungkan
            WhatsApp API.
          </p>

        </div>


        {/* MESSAGE */}

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

          <h2 className="text-lg font-bold text-slate-900">
            Pesan WhatsApp
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Baris pertama menentukan
            jenis logbook: UKP, UKM,
            atau TM.
          </p>

          <textarea
            value={message}
            onChange={(e) =>
              setMessage(
                e.target.value
              )
            }
            rows={18}
            className="mt-5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-900 outline-none focus:border-slate-400 focus:bg-white"
          />

          <button
            type="button"
            onClick={sendMessage}
            disabled={loading}
            className="mt-5 w-full rounded-xl bg-slate-900 px-5 py-4 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {loading
              ? "Mengirim..."
              : "📲 Simulasikan Pesan WhatsApp"}
          </button>

        </section>


        {/* RESULT */}

        {result && (

          <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

            <h2 className="text-lg font-bold text-slate-900">
              Hasil
            </h2>

            <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-900 p-5 text-sm text-white">
              {result}
            </pre>

          </section>

        )}

      </div>

    </main>
  );
}