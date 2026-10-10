"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">

      <div className="w-full max-w-md">

        {/* HEADER */}

        <div className="mb-10 text-center">

          <p className="text-sm font-semibold tracking-wide text-teal-600">
            LOGBOOK INTERNSIP
          </p>

          <h1 className="mt-3 text-4xl font-bold text-slate-900">
            Selamat datang 👋🏻
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Kelola dan lengkapi logbook internsip
            dengan lebih mudah.
          </p>

        </div>


        {/* CARD */}

        <div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200">

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full rounded-xl bg-slate-900 px-4 py-3.5 font-semibold text-white transition hover:bg-slate-800"
          >
            Masuk
          </button>


          <button
            type="button"
            onClick={() => router.push("/register")}
            className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Daftar
          </button>

        </div>


        {/* FOOTER */}

        <p className="mt-6 text-center text-xs text-slate-400">
          Logbook Internsip
        </p>

      </div>

    </main>
  );
}