
import { NextResponse } from "next/server";
import { createHash } from "node:crypto";

export const runtime = "nodejs";

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

function headers() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error("Konfigurasi Supabase server belum lengkap.");
  }

  return {
    apikey: SERVICE_KEY!,
    Authorization: `Bearer ${SERVICE_KEY!}`,
    "Content-Type": "application/json",
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    const username =
      typeof body?.username === "string"
        ? body.username.trim().toLowerCase()
        : "";

    const code =
      typeof body?.code === "string" ? body.code.trim() : "";

    const password =
      typeof body?.password === "string" ? body.password : "";

    if (
      !/^[a-z0-9_]{3,}$/.test(username) ||
      !/^\d{6}$/.test(code) ||
      password.length < 12 ||
      password.length > 128
    ) {
      return NextResponse.json(
        { error: "Data tidak valid. Periksa kembali isian kamu." },
        { status: 400 }
      );
    }

    const h = headers();

    // Cari profil berdasarkan username.
    const profileUrl = new URL(`${SUPABASE_URL}/rest/v1/profiles`);
    profileUrl.searchParams.set("username", `eq.${username}`);
    profileUrl.searchParams.set("select", "id");
    profileUrl.searchParams.set("limit", "1");

    const profileResponse = await fetch(profileUrl, {
      headers: h,
      cache: "no-store",
    });

    if (!profileResponse.ok) {
      throw new Error("Gagal mencari profil.");
    }

    const profiles = await profileResponse.json();
    const userId = profiles?.[0]?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Kode tidak valid atau sudah kedaluwarsa." },
        { status: 400 }
      );
    }

    // Cari kode yang masih aktif dan belum kedaluwarsa.
    
const codeUrl = new URL(
  `${SUPABASE_URL}/rest/v1/password_reset_codes`
);
codeUrl.searchParams.set("user_id", `eq.${userId}`);
codeUrl.searchParams.set("used_at", "is.null");
codeUrl.searchParams.set(
  "expires_at",
  `gt.${new Date().toISOString()}`
);
codeUrl.searchParams.set("attempts", "lt.5");
codeUrl.searchParams.set("select", "id,attempts,code_hash");
codeUrl.searchParams.set("order", "created_at.desc");
codeUrl.searchParams.set("limit", "1");

const codeResponse = await fetch(codeUrl, {
  headers: h,
  cache: "no-store",
});

if (!codeResponse.ok) {
  throw new Error("Gagal memeriksa kode.");
}

const codes = await codeResponse.json();
const resetCode = codes?.[0];

if (!resetCode) {
  return NextResponse.json(
    { error: "Kode tidak valid atau sudah kedaluwarsa." },
    { status: 400 }
  );
}

// Naikkan penghitung dengan kondisi agar dua permintaan bersamaan
// tidak dapat memperbarui percobaan berdasarkan nilai lama yang sama.
const attemptResponse = await fetch(
  `${SUPABASE_URL}/rest/v1/password_reset_codes?id=eq.${encodeURIComponent(resetCode.id)}&attempts=eq.${resetCode.attempts}&used_at=is.null`,
  {
    method: "PATCH",
    headers: {
      ...h,
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      attempts: resetCode.attempts + 1,
    }),
    cache: "no-store",
  }
);

if (!attemptResponse.ok) {
  throw new Error("Gagal memperbarui percobaan kode.");
}

const updatedRows = await attemptResponse.json();

if (!Array.isArray(updatedRows) || updatedRows.length !== 1) {
  return NextResponse.json(
    { error: "Permintaan kode gagal. Silakan coba lagi." },
    { status: 400 }
  );
}

if (resetCode.code_hash !== hashCode(code)) {
  return NextResponse.json(
    { error: "Kode tidak valid atau sudah kedaluwarsa." },
    { status: 400 }
  );
}


    // Perbarui password melalui Supabase Auth Admin API.
    const adminResponse = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users/${encodeURIComponent(userId)}`,
      {
        method: "PUT",
        headers: h,
        body: JSON.stringify({ password }),
        cache: "no-store",
      }
    );

    if (!adminResponse.ok) {
      const detail = await adminResponse.text();
      console.error("Supabase Admin update password gagal:", detail);

      return NextResponse.json(
        { error: "Password belum berhasil diubah. Silakan coba lagi." },
        { status: 500 }
      );
    }

    // Tandai kode sebagai sudah digunakan setelah password berhasil diubah.
    const usedResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/password_reset_codes?id=eq.${encodeURIComponent(resetCode.id)}&used_at=is.null`,
      {
        method: "PATCH",
        headers: {
          ...h,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ used_at: new Date().toISOString() }),
        cache: "no-store",
      }
    );

    if (!usedResponse.ok) {
      // Password sudah berubah; jangan memberi kesan bahwa perubahan gagal.
      // Periksa status kode di database jika permintaan ini mengalami error.
      console.error("Gagal menandai kode reset sebagai terpakai.");
    }

    return NextResponse.json({
      message: "Password berhasil diubah. Silakan login menggunakan password baru.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      { error: "Reset password belum dapat diproses. Coba lagi nanti." },
      { status: 500 }
    );
  }
}

