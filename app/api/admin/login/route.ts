import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminConfigured,
  checkPassword,
  clearFailures,
  clientKey,
  createSessionToken,
  lockedMinutes,
  recordFailure,
  sameOrigin,
} from "@/lib/adminAuth";

// Slow down password guessing: each failed attempt waits before answering,
// and 10 wrong passwords in 15 minutes lock that visitor out for the rest of the 15 minutes.
const FAIL_DELAY_MS = 1500;

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Bad request." }, { status: 403 });
  if (!adminConfigured()) {
    return NextResponse.json(
      { error: "The admin password set on the server is too short. It must be at least 8 characters." },
      { status: 503 },
    );
  }

  const key = clientKey(request);
  const wait = lockedMinutes(key);
  if (wait) {
    return NextResponse.json(
      { error: `Too many wrong passwords. Try again in ${wait} minute${wait === 1 ? "" : "s"}.` },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => ({}));
  if (!checkPassword(body?.password)) {
    recordFailure(key);
    await new Promise((resolve) => setTimeout(resolve, FAIL_DELAY_MS));
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  clearFailures(key);
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
