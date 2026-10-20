
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const cleanUsername = username.trim().toLowerCase();

    if (!cleanUsername) {
      setError("Username wajib diisi.");
      setLoading(false);
      return;
    }

    const internalEmail = `${cleanUsername}@logbook.local`;

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: internalEmail,
          password,
        });

      if (loginError) {
        setError("Username atau password salah.");
        return;
      }

      if (!data.session) {
        setError("Session tidak ditemukan.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Login gagal:", err);
      setError("Terjadi kendala saat masuk. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f7fb] px-4 py-10 sm:px-6">

      {/* BACKGROUND DECORATION */}

      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-teal-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-cyan-100/50 blur-3xl" />

      <div className="relative w-full max-w-md">

        {/* BRAND */}

        <div className="mb-7 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-[#102b35] to-teal-700 text-white shadow-[0_12px_28px_-10px_rgba(15,118,110,0.55)]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-8 w-8"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M7 3.75h7l4 4v12.5A.75.75 0 0 1 17.25 21h-10.5a.75.75 0 0 1-.75-.75V4.5a.75.75 0 0 1 .75-.75Z" />
              <path d="M14 4v4h4" />
              <path d="M9 13h6M9 16.5h6" />
              <path d="M9 9.5h1.5" />
            </svg>
          </div>

          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.22em] text-teal-700">
            Logbook Internsip
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-[34px]">
            Selamat datang
          </h1>

          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
            Masuk ke akunmu untuk melanjutkan pengelolaan logbook internsip.
          </p>
        </div>

        {/* LOGIN CARD */}

        <form
          onSubmit={handleLogin}
          className="rounded-[28px] border border-white bg-white p-6 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.18)] sm:p-8"
        >
          <div className="mb-7">
            <h2 className="text-xl font-bold text-slate-900">
              Masuk ke akun
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Masukkan username dan password kamu.
            </p>
          </div>

          {/* USERNAME */}

          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Username
            </label>

            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20a8 8 0 0 1 16 0" />
                </svg>
              </span>

              <input
                id="username"
                type="text"
                required
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
              />
            </div>
          </div>

          {/* PASSWORD */}

          <div className="mt-5">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Password
            </label>

            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="4" y="10" width="16" height="11" rx="2.5" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  <path d="M12 14v3" />
                </svg>
              </span>

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] py-3.5 pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                {showPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-5 w-5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.9 5.2A10.9 10.9 0 0 1 12 5c5.2 0 8.5 5 9 7-.3 1.1-1.2 2.4-2.5 3.6" />
                    <path d="M6.2 6.2C3.9 7.6 2.4 9.8 2 12c.5 2 3.8 7 10 7 1.1 0 2.1-.2 3-.5" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-5 w-5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => router.push("/lupa-password")}
                className="text-xs font-semibold text-teal-700 transition hover:text-teal-900"
              >
                Lupa password?
              </button>
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm text-red-700"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold">
                !
              </span>
              <p className="leading-5">{error}</p>
            </div>
          )}

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#153f49] to-teal-700 px-4 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_-8px_rgba(13,148,136,0.65)] transition hover:-translate-y-0.5 hover:from-[#102f38] hover:to-teal-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Memproses...
              </>
            ) : (
              <>
                Masuk ke Dashboard
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </>
            )}
          </button>

          {/* REGISTER */}

          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            <p className="text-sm text-slate-500">
              Belum punya akun?{" "}
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="font-bold text-teal-700 transition hover:text-teal-900"
              >
                Daftar sekarang
              </button>
            </p>
          </div>
        </form>

        {/* BACK */}

        <button
          type="button"
          onClick={() => router.push("/")}
          className="mx-auto mt-6 flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition hover:text-slate-700"
        >
          <span>←</span>
          Kembali ke halaman utama
        </button>

        <p className="mt-5 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
          Logbook Internsip · Kemenkes
        </p>
      </div>
    </main>
  );
}
