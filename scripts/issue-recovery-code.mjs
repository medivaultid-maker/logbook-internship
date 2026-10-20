
import { createClient } from "@supabase/supabase-js";
import { createHash, randomBytes } from "node:crypto";

const username = process.argv[2]?.trim().toLowerCase();

if (!username) {
  console.error(
    "Pemakaian: node --env-file=.env.local scripts/issue-recovery-code.mjs USERNAME"
  );
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error("Konfigurasi Supabase tidak lengkap.");
}

const admin = createClient(url, key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const email = `${username}@logbook.local`;
const { data, error } = await admin.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
});

if (error) throw error;

const user = data.users.find(
  (item) => item.email?.toLowerCase() === email
);

if (!user) {
  throw new Error(
    "Akun Auth tidak ditemukan. Tidak ada kode yang diterbitkan."
  );
}

const code = randomBytes(32).toString("base64url");
const codeHash = createHash("sha256")
  .update(code)
  .digest("hex");

const expiresAt = new Date(
  Date.now() + 24 * 60 * 60 * 1000
).toISOString();

const { error: saveError } = await admin
  .from("password_recovery_codes")
  .upsert({
    username,
    auth_user_id: user.id,
    code_hash: codeHash,
    expires_at: expiresAt,
    used_at: null,
  });

if (saveError) throw saveError;

console.log("\nKODE PEMULIHAN (tampilkan sekali):");
console.log(code);
console.log("\nBerlaku sampai:", expiresAt);
console.log("Simpan kode ini secara aman.");
