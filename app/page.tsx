
"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f8fb] px-5 py-12">
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-teal-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-100/40 blur-3xl" />

      <div className="relative w-full max-w-lg">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#102a43] text-white shadow-lg shadow-slate-900/10">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-7 w-7"
              aria-hidden="true"
            >
              <path
                d="M12 3v18M3 12h18"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <rect
                x="4"
                y="4"
                width="16"
                height="16"
                rx="4"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          <div>
            <p className="text-base font-bold tracking-tight text-slate-900">
              Logbook Internsip
            </p>
            <p className="text-xs font-medium tracking-[0.14em] text-teal-700">
              MEDICAL WORKFLOW
            </p>
          </div>
        </div>

        <section className="rounded-[28px] border border-white bg-white/90 p-7 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.18)] backdrop-blur sm:p-10">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">
            <span className="h-2 w-2 rounded-full bg-teal-500" />
            Ruang kerja dokter internsip
          </div>

          <h1 className="mt-3 mb-8 text-4xl font-bold text-slate-900">
  Kelola logbook dengan lebih terstruktur.
</h1>



          <button
  type="button"
  onClick={() => router.push("/login")}
  className="mt-2 w-full rounded-xl bg-[#112C46] px-4 py-5 text-xl font-semibold text-white shadow-lg shadow-slate-900/10 transition duration-200 hover:bg-[#193B59]"
>
  Masuk
</button>

          <button
            type="button"
            onClick={() => router.push("/register")}
            className="premium-button mt-3 w-full border border-slate-200 bg-white px-5 py-4 text-sm text-slate-700 hover:border-teal-200 hover:bg-teal-50/50"
          >
            Buat akun baru
          </button>

        </section>

        <footer className="mt-7 text-center text-xs text-slate-400">
          Logbook Internsip · Medical Workflow Platform
        </footer>
      </div>
    </main>
  );
}
