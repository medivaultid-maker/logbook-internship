"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const cleanUsername =
      username.trim().toLowerCase();

    if (!cleanUsername) {
      setError("Username wajib diisi.");
      setLoading(false);
      return;
    }

    /*
     * USER LOGIN PAKAI USERNAME
     *
     * Supabase Auth tetap menggunakan email
     * di belakang layar.
     */

    const internalEmail =
      `${cleanUsername}@logbook.local`;


    const {
      data,
      error: loginError,
    } =
      await supabase.auth.signInWithPassword({
        email: internalEmail,
        password,
      });


    console.log(
      "LOGIN DATA:",
      data
    );

    console.log(
      "LOGIN ERROR:",
      loginError
    );


    if (loginError) {
      setError(
        "Username atau password salah."
      );

      setLoading(false);
      return;
    }


    if (!data.session) {
      setError(
        "Session tidak ditemukan."
      );

      setLoading(false);
      return;
    }


    router.push("/dashboard");
    router.refresh();
  }


  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">

      <div className="w-full max-w-md">

        <div className="mb-8 text-center">

          <p className="text-sm font-semibold tracking-wide text-teal-600">
            LOGBOOK INTERNSIP
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Selamat datang 👋🏻
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Masuk untuk mengelola logbook kamu.
          </p>

        </div>


        <form
          onSubmit={handleLogin}
          className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200"
        >

          {/* USERNAME */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Username
            </label>

            <input
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              placeholder="Masukkan username"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white"
            />

          </div>


          {/* PASSWORD */}

          <div className="mt-5">

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>

            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Masukkan password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white"
            />

          </div>


          {/* ERROR */}

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}


          {/* LOGIN */}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3.5 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Memproses..."
              : "Masuk"}
          </button>


          {/* REGISTER */}

          <p className="mt-5 text-center text-sm text-slate-500">

            Belum punya akun?{" "}

            <button
              type="button"
              onClick={() =>
                router.push("/register")
              }
              className="font-semibold text-teal-600 hover:text-teal-700"
            >
              Daftar
            </button>

          </p>

        </form>


        <button
          type="button"
          onClick={() =>
            router.push("/")
          }
          className="mt-5 block w-full text-center text-sm text-slate-400 hover:text-slate-600"
        >
          ← Kembali
        </button>

      </div>

    </main>
  );
}