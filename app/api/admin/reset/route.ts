import { NextResponse } from "next/server";
import { MIN_PASSWORD_LENGTH, clearAllFailures, hashPassword, sameOrigin } from "@/lib/adminAuth";
import { peekResetToken, setPasswordHash } from "@/lib/adminAccount";
import { alertPasswordChanged } from "@/lib/adminAlerts";
import { siteUrl } from "@/lib/mailer";

const EXPIRED = "This reset link has expired or was already used. Go back to the login page and ask for a new one.";

/** GET ?token=… checks a link before showing the form. */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  return (await peekResetToken(token))
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: EXPIRED }, { status: 400 });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Bad request." }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const password = typeof body?.password === "string" ? body.password : "";
  if (password.length < MIN_PASSWORD_LENGTH || password.length > 200) {
    return NextResponse.json({ error: `Use at least ${MIN_PASSWORD_LENGTH} characters.` }, { status: 400 });
  }

  const email = await peekResetToken(body?.token);
  if (!email) return NextResponse.json({ error: EXPIRED }, { status: 400 });

  // Saving the new password also cancels every reset link, including this one.
  await setPasswordHash(hashPassword(password));
  clearAllFailures();
  alertPasswordChanged(`reset with a link sent to ${email}`, siteUrl(request));
  return NextResponse.json({ ok: true });
}
