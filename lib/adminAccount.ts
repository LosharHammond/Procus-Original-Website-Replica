// Admin account data that changes while the site is running: a password set from the
// admin panel (or by a reset link), the recovery email list, and pending reset links.
// Kept in the admin storage (admin-account.json, see lib/storage.ts), never in the code.

import crypto from "crypto";
import { getJson, setJson } from "@/lib/storage";

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

const ACCOUNT_KEY = "admin-account.json";

async function read(): Promise<Account> {
  return (await getJson<Account>(ACCOUNT_KEY)) ?? {};
}

async function write(account: Account) {
  await setJson(ACCOUNT_KEY, account);
}

export function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isValidEmail(email: string) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---------- password ----------

export async function storedPasswordHash() {
  return (await read()).passwordHash;
}

export async function passwordChangedAt() {
  return (await read()).passwordChangedAt;
}

/** Save a new password fingerprint. Any unused reset links stop working. */
export async function setPasswordHash(hash: string) {
  const account = await read();
  account.passwordHash = hash;
  account.passwordChangedAt = new Date().toISOString();
  account.resetTokens = [];
  await write(account);
}

// ---------- recovery emails ----------

export async function getRecoveryEmails() {
  return (await read()).recoveryEmails ?? DEFAULT_RECOVERY_EMAILS;
}

export async function setRecoveryEmails(emails: string[]) {
  const account = await read();
  account.recoveryEmails = emails;
  await write(account);
}

// ---------- reset links ----------

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** Create a single-use reset link token for this address. Only its fingerprint is stored. */
export async function createResetToken(email: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  const account = await read();
  const now = Date.now();
  const active = (account.resetTokens ?? []).filter((t) => t.expires > now);
  active.push({ tokenHash: hashToken(token), email, expires: now + RESET_LINK_MINUTES * 60_000 });
  account.resetTokens = active.slice(-20);
  await write(account);
  return { token, minutes: RESET_LINK_MINUTES };
}

/** Check a reset token without using it up. Returns the address it was sent to, or null. */
export async function peekResetToken(token: unknown) {
  if (typeof token !== "string" || token.length < 20 || token.length > 100) return null;
  const tokenHash = hashToken(token);
  const found = ((await read()).resetTokens ?? []).find((t) => t.tokenHash === tokenHash && t.expires > Date.now());
  return found ? found.email : null;
}
