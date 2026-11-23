import { NextResponse } from "next/server";
import { isAdmin, passwordSource, sameOrigin } from "@/lib/adminAuth";
import {
  MAX_RECOVERY_EMAILS,
  getRecoveryEmails,
  isValidEmail,
  normalizeEmail,
  passwordChangedAt,
  setRecoveryEmails,
} from "@/lib/adminAccount";
import { mailConfigured } from "@/lib/mailer";

export const dynamic = "force-dynamic";

async function state() {
  return {
    recoveryEmails: await getRecoveryEmails(),
    emailReady: mailConfigured(),
    passwordSource: await passwordSource(),
    passwordChangedAt: (await passwordChangedAt()) ?? null,
  };
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  return NextResponse.json(await state(), { headers: { "Cache-Control": "no-store" } });
}

/** Replace the recovery email list. At least one address is required. */
export async function PUT(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Bad request." }, { status: 403 });
  if (!(await isAdmin())) return NextResponse.json({ error: "Please log in again." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (!Array.isArray(body?.recoveryEmails)) return NextResponse.json({ error: "Nothing to save." }, { status: 400 });
  const emails = [...new Set((body.recoveryEmails as unknown[]).map(normalizeEmail))];
  const invalid = emails.find((e) => !isValidEmail(e));
  if (invalid !== undefined) return NextResponse.json({ error: `"${invalid}" is not a valid email address.` }, { status: 400 });
  if (emails.length === 0)
    return NextResponse.json({ error: "Keep at least one recovery email, or nobody could reset the password." }, { status: 400 });
  if (emails.length > MAX_RECOVERY_EMAILS)
    return NextResponse.json({ error: `You can have up to ${MAX_RECOVERY_EMAILS} recovery emails.` }, { status: 400 });

  await setRecoveryEmails(emails);
  return NextResponse.json(await state());
}
