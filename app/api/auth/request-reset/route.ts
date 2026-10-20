
import { NextResponse } from "next/server";
import { randomInt, createHash } from "node:crypto";

export const runtime = "nodejs";

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const GENERIC_MESSAGE =
  "Jika akun ditemukan dan Telegram sudah terhubung, kode pemulihan akan dikirim. Periksa Telegram kamu.";

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

function supabaseHeaders() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error("Konfigurasi Supabase server belum lengkap.");
  }

  return {
    apikey: SERVICE_KEY!,
    Authorization: `Bearer ${SERVICE_KEY!}`,
    "Content-Type": "application/json",
  };
}

async function sendTelegramCode(chatId: string, code: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN belum diatur.");
  }

  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text:
          "🔐 Pemulihan Password Logbook Internsip\n\n" +
          `Kode pemulihan kamu: ${code}\n\n` +
          "Kode berlaku selama 10 menit dan hanya dapat digunakan satu kali. " +
          "Jangan bagikan kode ini kepada siapa pun.\n\n" +
          "Jika kamu tidak meminta reset password, abaikan pesan ini.",
      }),
      cache: "no-store",
    }
  );

  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error("Telegram gagal mengirim kode.");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const username =
      typeof body?.username === "string"
        ? body.username.trim().toLowerCase()
        : "";

    // Format username sama dengan aturan saat registrasi.
    if (!/^[a-z0-9_]{3,}$/.test(username)) {
      return NextResponse.json({ message: GENERIC_MESSAGE });
    }

    const headers = supabaseHeaders();

    // Cari akun melalui username, bukan ID Telegram dari input pengguna.
    const profileUrl = new URL(`${SUPABASE_URL}/rest/v1/profiles`);
    profileUrl.searchParams.set("username", `eq.${username}`);
    profileUrl.searchParams.set("select", "id,telegram_chat_id");
    profileUrl.searchParams.set("limit", "1");

    const profileResponse = await fetch(profileUrl, {
      headers,
      cache: "no-store",
    });

    if (!profileResponse.ok) {
      throw new Error("Gagal mencari profil.");
    }

    const profiles = await profileResponse.json();
    const profile = profiles?.[0];

    // Respons tetap generik jika akun tidak ditemukan atau Telegram belum terhubung.
    if (!profile?.id || !profile?.telegram_chat_id) {
      return NextResponse.json({ message: GENERIC_MESSAGE });
    }

    // Batasi permintaan kode baru: maksimal satu per 60 detik per akun.
    const recentUrl = new URL(
      `${SUPABASE_URL}/rest/v1/password_reset_codes`
    );
    recentUrl.searchParams.set("user_id", `eq.${profile.id}`);
    recentUrl.searchParams.set(
      "created_at",
      `gte.${new Date(Date.now() - 60_000).toISOString()}`
    );
    recentUrl.searchParams.set("select", "id");
    recentUrl.searchParams.set("limit", "1");

    const recentResponse = await fetch(recentUrl, {
      headers,
      cache: "no-store",
    });

    if (!recentResponse.ok) {
      throw new Error("Gagal memeriksa permintaan sebelumnya.");
    }

    const recentCodes = await recentResponse.json();

    if (recentCodes.length > 0) {
      return NextResponse.json({ message: GENERIC_MESSAGE });
    }

    // Nonaktifkan kode sebelumnya yang belum digunakan.
    const invalidateUrl = new URL(
      `${SUPABASE_URL}/rest/v1/password_reset_codes`
    );
    invalidateUrl.searchParams.set("user_id", `eq.${profile.id}`);
    invalidateUrl.searchParams.set("used_at", "is.null");

    const invalidateResponse = await fetch(invalidateUrl, {
      method: "PATCH",
      headers: {
        ...headers,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ used_at: new Date().toISOString() }),
      cache: "no-store",
    });

    if (!invalidateResponse.ok) {
      throw new Error("Gagal menonaktifkan kode sebelumnya.");
    }

    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();

    const insertResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/password_reset_codes`,
      {
        method: "POST",
        headers: {
          ...headers,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          user_id: profile.id,
          code_hash: hashCode(code),
          expires_at: expiresAt,
          attempts: 0,
          used_at: null,
        }),
        cache: "no-store",
      }
    );

    if (!insertResponse.ok) {
      throw new Error("Gagal menyimpan kode pemulihan.");
    }

    try {
      await sendTelegramCode(String(profile.telegram_chat_id), code);
    } catch (error) {
      // Batalkan kode yang gagal dikirim agar tidak tersisa sebagai kode aktif.
      await fetch(
        `${SUPABASE_URL}/rest/v1/password_reset_codes?user_id=eq.${encodeURIComponent(profile.id)}&used_at=is.null`,
        {
          method: "PATCH",
          headers: {
            ...headers,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ used_at: new Date().toISOString() }),
          cache: "no-store",
        }
      );

      throw error;
    }

    return NextResponse.json({ message: GENERIC_MESSAGE });
  } catch (error) {
    console.error("Request reset error:", error);

    return NextResponse.json(
      { error: "Permintaan belum dapat diproses. Coba lagi nanti." },
      { status: 500 }
    );
  }
}
