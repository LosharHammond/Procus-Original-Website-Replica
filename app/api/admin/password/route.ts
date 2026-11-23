import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  MIN_PASSWORD_LENGTH,
  checkPassword,
  createSessionToken,
  hashPassword,
  isAdmin,
  sameOrigin,
} from "@/lib/adminAuth";
import { setPasswordHash } from "@/lib/adminAccount";
import { alertPasswordChanged } from "@/lib/adminAlerts";
import { siteUrl } from "@/lib/mailer";

/** Change the password while logged in. Other browsers are logged out; this one stays logged in. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Bad request." }, { status: 403 });
  if (!(await isAdmin())) return NextResponse.json({ error: "Please log in again." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (!checkPassword(body?.current)) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return NextResponse.json({ error: "The current password is wrong." }, { status: 400 });
  }
  const next = typeof body?.next === "string" ? body.next : "";
  if (next.length < MIN_PASSWORD_LENGTH || next.length > 200) {
    return NextResponse.json({ error: `Use at least ${MIN_PASSWORD_LENGTH} characters for the new password.` }, { status: 400 });
  }

  setPasswordHash(hashPassword(next));
  alertPasswordChanged("changed from the admin panel", siteUrl(request));

  const { token, maxAge } = createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && new URL(request.url).protocol === "https:",
    path: "/",
    maxAge,
  });
  return response;
}
