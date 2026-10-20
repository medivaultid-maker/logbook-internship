"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LupaPasswordPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [requestingCode, setRequestingCode] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================
  // MEMINTA KODE PEMULIHAN VIA TELEGRAM
  // =========================================

  async function handleRequestCode() {
    setError("");
    setSuccess("");

    const cleanUsername = username.trim().toLowerCase();

    if (!/^[a-z0-9_]{3,}$/.test(cleanUsername)) {
      setError("Masukkan username yang valid terlebih dahulu.");
      return;
    }

    setRequestingCode(true);

    try {
      const response = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: cleanUsername,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error || "Permintaan kode belum berhasil."
        );
        return;
      }

      setUsername(cleanUsername);

      setSuccess(
        result.message ||
          "Jika akun ditemukan dan Telegram sudah terhubung, kode pemulihan akan dikirim."
      );
    } catch {
      setError(
        "Tidak dapat menghubungi server. Silakan coba lagi."
      );
    } finally {
      setRequestingCode(false);
    }
  }

  // =========================================
  // RESET PASSWORD
  // =========================================

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanUsername = username.trim().toLowerCase();
    const cleanCode = code.trim();

    if (!/^[a-z0-9_]{3,}$/.test(cleanUsername)) {
      setError("Username tidak valid.");
      return;
    }

    if (!/^\d{6}$/.test(cleanCode)) {
      setError("Kode pemulihan harus terdiri dari 6 angka.");
      return;
    }

    if (password.length < 12) {
      setError("Password minimal 12 karakter.");
      return;
    }

    if (password.length > 128) {
      setError("Password maksimal 128 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: cleanUsername,
          code: cleanCode,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error || "Reset password gagal."
        );
        return;
      }

      setSuccess(
        result.message ||
          "Password berhasil diubah. Silakan login menggunakan password baru."
      );

      setUsername("");
      setCode("");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError(
        "Tidak dapat menghubungi server. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================
  // TAMPILAN HALAMAN
  // =========================================

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200"
      >
        {/* HEADER */}

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Lupa Password?
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Masukkan username untuk meminta kode pemulihan
            melalui Telegram yang sudah terhubung dengan
            akunmu.
          </p>
        </div>

        {/* USERNAME */}

        <div>
          <label
            htmlFor="username"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Username
          </label>

          <input
            id="username"
            type="text"
            required
            minLength={3}
            maxLength={64}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading || requestingCode}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400 disabled:bg-slate-50"
            placeholder="Masukkan username"
          />
        </div>

        {/* TOMBOL KIRIM KODE */}

        <button
          type="button"
          onClick={handleRequestCode}
          disabled={requestingCode || loading}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {requestingCode
            ? "Meminta kode..."
            : "Kirim kode ke Telegram"}
        </button>

        <p className="-mt-3 text-xs leading-5 text-slate-500">
          Kode dikirim ke Telegram yang terhubung dengan
          akunmu. Kode berlaku selama 10 menit.
        </p>

        {/* KODE PEMULIHAN */}

        <div>
          <label
            htmlFor="code"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Kode pemulihan
          </label>

          <input
            id="code"
            type="text"
            required
            inputMode="numeric"
            pattern="[0-9]{6}"
            minLength={6}
            maxLength={6}
            autoComplete="one-time-code"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            disabled={loading}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 tracking-widest outline-none transition focus:border-slate-400 disabled:bg-slate-50"
            placeholder="000000"
          />
        </div>

        {/* PASSWORD BARU */}

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Password baru
          </label>

          <input
            id="password"
            type="password"
            required
            minLength={12}
            maxLength={128}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400 disabled:bg-slate-50"
            placeholder="Minimal 12 karakter"
          />
        </div>

        {/* KONFIRMASI PASSWORD */}

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Konfirmasi password baru
          </label>

          <input
            id="confirmPassword"
            type="password"
            required
            minLength={12}
            maxLength={128}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            disabled={loading}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400 disabled:bg-slate-50"
            placeholder="Ulangi password baru"
          />
        </div>

        {/* PESAN ERROR */}

        {error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-3 text-sm leading-5 text-red-700"
          >
            {error}
          </p>
        )}

        {/* PESAN SUKSES */}

        {success && (
          <p
            role="status"
            className="rounded-xl bg-green-50 p-3 text-sm leading-5 text-green-700"
          >
            {success}
          </p>
        )}

        {/* SUBMIT RESET PASSWORD */}

        <button
          type="submit"
          disabled={loading || requestingCode}
          className="w-full rounded-xl bg-slate-900 px-4 py-3.5 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Memproses..."
            : "Atur ulang password"}
        </button>

        {/* KEMBALI KE LOGIN */}

        <button
          type="button"
          onClick={() => router.push("/login")}
          disabled={loading || requestingCode}
          className="w-full py-2 text-sm text-slate-500 transition hover:text-slate-800 disabled:opacity-50"
        >
          ← Kembali ke halaman login
        </button>
      </form>
    </main>
  );
}