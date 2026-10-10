"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    const cleanUsername =
      username.trim().toLowerCase();

    if (!cleanUsername) {
      setError("Username wajib diisi.");
      return;
    }

    if (cleanUsername.length < 3) {
      setError("Username minimal 3 karakter.");
      return;
    }

    if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
      setError(
        "Username hanya boleh menggunakan huruf, angka, dan underscore."
      );
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);

    try {
      /*
       * CEK USERNAME
       */

      const {
        data: existingProfile,
        error: checkError,
      } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", cleanUsername)
        .maybeSingle();

      if (checkError) {
        console.error(
          "USERNAME CHECK ERROR:",
          checkError
        );

        setError(
          "Tidak dapat memeriksa username."
        );

        setLoading(false);
        return;
      }

      if (existingProfile) {
        setError("Username sudah digunakan.");
        setLoading(false);
        return;
      }


      /*
       * EMAIL INTERNAL
       *
       * User tetap login menggunakan username.
       */

      const internalEmail =
        `${cleanUsername}@logbook.local`;


      /*
       * BUAT AKUN SUPABASE AUTH
       */

      const {
        data,
        error: signUpError,
      } =
        await supabase.auth.signUp({
          email: internalEmail,
          password,
        });

      console.log(
        "REGISTER DATA:",
        data
      );

      console.log(
        "REGISTER ERROR:",
        signUpError
      );


      if (signUpError) {
        setError(
          signUpError.message
        );

        setLoading(false);
        return;
      }


      if (!data.user) {
        setError(
          "Akun gagal dibuat."
        );

        setLoading(false);
        return;
      }


      /*
       * PROFILE AKAN DIBUAT OTOMATIS
       * OLEH DATABASE TRIGGER
       */


      /*
       * LANGSUNG MASUK
       */

      router.push("/dashboard");
      router.refresh();

    } catch (err) {

      console.error(
        "REGISTER ERROR:",
        err
      );

      setError(
        "Terjadi kesalahan. Silakan coba lagi."
      );

      setLoading(false);
    }
  }


  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">

      <div className="w-full max-w-md">

        <div className="mb-8 text-center">

          <p className="text-sm font-semibold tracking-wide text-teal-600">
            LOGBOOK INTERNSIP
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Buat akun
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Daftar untuk mulai mengelola logbook kamu.
          </p>

        </div>


        <form
          onSubmit={handleRegister}
          className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200"
        >

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
              placeholder="contoh: jasmine"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white"
            />

            <p className="mt-1.5 text-xs text-slate-400">
              Gunakan huruf, angka, atau underscore.
            </p>

          </div>


          <div className="mt-5">

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>

            <input
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Minimal 6 karakter"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white"
            />

          </div>


          <div className="mt-5">

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Konfirmasi Password
            </label>

            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Ulangi password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white"
            />

          </div>


          {error && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}


          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3.5 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Membuat akun..."
              : "Daftar"}
          </button>


          <p className="mt-5 text-center text-sm text-slate-500">

            Sudah punya akun?{" "}

            <button
              type="button"
              onClick={() =>
                router.push("/login")
              }
              className="font-semibold text-teal-600 hover:text-teal-700"
            >
              Masuk
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