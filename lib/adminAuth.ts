// Admin login for /admin.
//
// Which password is used, first match wins:
//   1. a password changed from the admin panel or with a reset link (stored in the storage folder)
//   2. ADMIN_PASSWORD set on the server
//   3. the built-in password below, stored as a scrypt fingerprint (hash), not as plain text:
//      the site can check a typed password against it, but the password can't be read back from it.
//
// A signed, http-only cookie keeps the admin logged in for SESSION_DAYS.

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { cookies } from "next/headers";
import { contentDir } from "@/lib/content/store";
import { storedPasswordHash } from "@/lib/adminAccount";

export const ADMIN_COOKIE = "procus_admin";
const SESSION_DAYS = 7;

/** Fingerprint of the admin password: "scrypt$<cost>$<salt>$<hash>". */
const ADMIN_PASSWORD_HASH = "scrypt$16384$+nUT4/vE0i/vlxA8aJbBGA==$P31zAykW4U9J1Mt0cZj+u3euDHV05ZBjpAQ6/9SkHYuVkb8RVbnXK7X1B4ypwqJskefWQBwLcz6U8lBXPlsU0A==";

export const MIN_PASSWORD_LENGTH = 8;

type ActivePassword = { kind: "hash"; hash: string; source: "changed" | "built-in" } | { kind: "plain"; value: string };

function activePassword(): ActivePassword {
  const changed = storedPasswordHash();
  if (changed) return { kind: "hash", hash: changed, source: "changed" };
  if (process.env.ADMIN_PASSWORD) return { kind: "plain", value: process.env.ADMIN_PASSWORD };
  return { kind: "hash", hash: ADMIN_PASSWORD_HASH, source: "built-in" };
}

/** Where the current password comes from, for the admin panel. */
export function passwordSource() {
  const active = activePassword();
  return active.kind === "plain" ? "server" : active.source;
}

export function adminConfigured() {
  const active = activePassword();
  // A password set on the server must be at least 8 characters.
  return active.kind === "plain" ? active.value.length >= MIN_PASSWORD_LENGTH : Boolean(active.hash);
}

/** Make the fingerprint stored for a new password. */
export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$16384$${salt.toString("base64")}$${hash.toString("base64")}`;
}

function safeEqual(a: Buffer, b: Buffer) {
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function matchesHash(password: string, fingerprint: string) {
  const [scheme, cost, salt, hash] = fingerprint.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const given = crypto.scryptSync(password, Buffer.from(salt, "base64"), expected.length, {
    N: Number(cost),
    r: 8,
    p: 1,
  });
  return safeEqual(given, expected);
}

export function checkPassword(password: unknown) {
  if (!adminConfigured() || typeof password !== "string" || password.length > 200) return false;
  const active = activePassword();
  if (active.kind === "plain") {
    // Compare hashes so the comparison takes the same time whatever the length.
    const given = crypto.createHash("sha256").update(password).digest();
    const expected = crypto.createHash("sha256").update(active.value).digest();
    return safeEqual(given, expected);
  }
  return matchesHash(password, active.hash);
}

// ---------- sessions ----------

let cachedSecret: string | null = null;

/**
 * Key used to sign login cookies. It must stay private, so it is NOT in the code:
 * it comes from ADMIN_SESSION_SECRET, or is generated once and kept in the storage folder.
 * Changing the password also logs everyone out, because the password fingerprint is part of the key.
 */
function secret() {
  const active = activePassword();
  const password = active.kind === "plain" ? active.value : active.hash;
  if (process.env.ADMIN_SESSION_SECRET) return `${process.env.ADMIN_SESSION_SECRET}:${password}`;
  if (!cachedSecret) {
    const file = path.join(contentDir(), ".admin-session-secret");
    try {
      cachedSecret = fs.readFileSync(file, "utf8").trim();
    } catch {
      cachedSecret = crypto.randomBytes(32).toString("hex");
      fs.mkdirSync(contentDir(), { recursive: true });
      fs.writeFileSync(file, cachedSecret, { mode: 0o600 });
    }
  }
  return `${cachedSecret}:${password}`;
}

function sign(value: string) {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

export function createSessionToken() {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  return { token: `${expires}.${sign(`admin:${expires}`)}`, maxAge: SESSION_DAYS * 24 * 60 * 60 };
}

export function verifySessionToken(token: string | undefined) {
  if (!adminConfigured() || !token) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return safeEqual(Buffer.from(signature), Buffer.from(sign(`admin:${expires}`)));
}

export async function isAdmin() {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}

// ---------- too many wrong passwords ----------

const MAX_FAILURES = 10;
// Visitor addresses can be faked, so also cap wrong passwords across the whole site.
// Admins who are already logged in are not affected.
const MAX_FAILURES_SITE_WIDE = 30;
const SITE_WIDE = "*";
const LOCK_MINUTES = 15;
const failures = new Map<string, { count: number; first: number }>();

export function clientKey(request: Request) {
  // The last address is the one added by the server's own proxy, which visitors can't fake.
  const forwarded = request.headers.get("x-forwarded-for")?.split(",").map((s) => s.trim()).filter(Boolean);
  return forwarded?.at(-1) || request.headers.get("x-real-ip") || "unknown";
}

function minutesLeft(key: string, max: number) {
  const entry = failures.get(key);
  if (!entry) return 0;
  const elapsed = Date.now() - entry.first;
  if (elapsed > LOCK_MINUTES * 60_000) {
    failures.delete(key);
    return 0;
  }
  return entry.count >= max ? Math.ceil((LOCK_MINUTES * 60_000 - elapsed) / 60_000) : 0;
}

/** Minutes until this visitor may try again, or 0 if logins are allowed. */
export function lockedMinutes(key: string) {
  return Math.max(minutesLeft(key, MAX_FAILURES), minutesLeft(SITE_WIDE, MAX_FAILURES_SITE_WIDE));
}

function bump(key: string) {
  const entry = failures.get(key);
  if (!entry || Date.now() - entry.first > LOCK_MINUTES * 60_000) failures.set(key, { count: 1, first: Date.now() });
  else entry.count += 1;
}

export function recordFailure(key: string) {
  bump(key);
  bump(SITE_WIDE);
}

export function clearFailures(key: string) {
  failures.delete(key);
}

/** After a password reset, let everyone try again. */
export function clearAllFailures() {
  failures.clear();
}

/** Reject state-changing requests that come from another website. */
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin fetches from older browsers may omit it
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
