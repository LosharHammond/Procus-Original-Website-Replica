// Admin account data that changes while the site is running: a password set from the
// admin panel (or by a reset link), the recovery email list, and pending reset links.
// Kept in the storage folder (admin-account.json), never in the code.

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { contentDir } from "@/lib/content/store";

/** Recovery addresses used until an admin changes the list in the admin panel. */
export const DEFAULT_RECOVERY_EMAILS = ["hammond@procusghana.com"];
export const MAX_RECOVERY_EMAILS = 10;
const RESET_LINK_MINUTES = 60;

type ResetToken = { tokenHash: string; email: string; expires: number };

type Account = {
  /** scrypt fingerprint of a password set from the admin panel or a reset link */
  passwordHash?: string;
  passwordChangedAt?: string;
  recoveryEmails?: string[];
  resetTokens?: ResetToken[];
};

function file() {
  return path.join(contentDir(), "admin-account.json");
}

function read(): Account {
  try {
    return JSON.parse(fs.readFileSync(file(), "utf8")) as Account;
  } catch {
    return {};
  }
}

function write(account: Account) {
  fs.mkdirSync(contentDir(), { recursive: true });
  const tmp = `${file()}.${crypto.randomBytes(4).toString("hex")}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(account, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, file());
}

export function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isValidEmail(email: string) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---------- password ----------

export function storedPasswordHash() {
  return read().passwordHash;
}

export function passwordChangedAt() {
  return read().passwordChangedAt;
}

/** Save a new password fingerprint. Any unused reset links stop working. */
export function setPasswordHash(hash: string) {
  const account = read();
  account.passwordHash = hash;
  account.passwordChangedAt = new Date().toISOString();
  account.resetTokens = [];
  write(account);
}

// ---------- recovery emails ----------

export function getRecoveryEmails() {
  return read().recoveryEmails ?? DEFAULT_RECOVERY_EMAILS;
}

export function setRecoveryEmails(emails: string[]) {
  const account = read();
  account.recoveryEmails = emails;
  write(account);
}

// ---------- reset links ----------

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** Create a single-use reset link token for this address. Only its fingerprint is stored. */
export function createResetToken(email: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  const account = read();
  const now = Date.now();
  const active = (account.resetTokens ?? []).filter((t) => t.expires > now);
  active.push({ tokenHash: hashToken(token), email, expires: now + RESET_LINK_MINUTES * 60_000 });
  account.resetTokens = active.slice(-20);
  write(account);
  return { token, minutes: RESET_LINK_MINUTES };
}

/** Check a reset token without using it up. Returns the address it was sent to, or null. */
export function peekResetToken(token: unknown) {
  if (typeof token !== "string" || token.length < 20 || token.length > 100) return null;
  const tokenHash = hashToken(token);
  const found = (read().resetTokens ?? []).find((t) => t.tokenHash === tokenHash && t.expires > Date.now());
  return found ? found.email : null;
}
