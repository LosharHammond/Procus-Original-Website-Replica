import { NextResponse, after } from "next/server";
import { sameOrigin } from "@/lib/adminAuth";
import { createResetToken, getRecoveryEmails, isValidEmail, normalizeEmail } from "@/lib/adminAccount";
import { mailConfigured, sendEmail, siteUrl } from "@/lib/mailer";

// The answer is the same whether or not the address is on the recovery list,
// so this form can't be used to find out which addresses are.
const ANSWER =
  "If that address is on the recovery list, a reset link is on its way. It works once and expires in 1 hour. Check the spam folder too.";

// Limit how many reset emails can be sent: per address, and for the whole site.
const PER_ADDRESS_PER_HOUR = 3;
const SITE_WIDE_PER_HOUR = 20;
const sent: { email: string; at: number }[] = [];

function allowed(email: string) {
  const hourAgo = Date.now() - 60 * 60_000;
  while (sent.length && sent[0].at < hourAgo) sent.shift();
  return sent.length < SITE_WIDE_PER_HOUR && sent.filter((s) => s.email === email).length < PER_ADDRESS_PER_HOUR;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Bad request." }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const email = normalizeEmail(body?.email);
  if (!isValidEmail(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  // Done after the reply, so the answer takes the same time whether or not an email is sent.
  // The server keeps running until it is finished (needed on Netlify).
  after(async () => {
    if ((await getRecoveryEmails()).includes(email) && allowed(email)) {
      if (!mailConfigured()) {
        console.error("Password reset requested, but email (SMTP) is not set up on the server.");
      } else {
        sent.push({ email, at: Date.now() });
        const { token, minutes } = await createResetToken(email);
        const link = `${siteUrl(request)}/admin/reset?token=${encodeURIComponent(token)}`;
        const text = [
          "Someone asked to reset the admin password for the Procus Ghana website.",
          "",
          `Choose a new password here (the link works once and expires in ${minutes} minutes):`,
          link,
          "",
          "If you didn't ask for this, ignore this email. The password stays the same.",
        ].join("\n");
        const html = `<p>Someone asked to reset the admin password for the Procus Ghana website.</p>
<p><a href="${link}">Choose a new password</a>. The link works once and expires in ${minutes} minutes.</p>
<p>If you didn't ask for this, ignore this email. The password stays the same.</p>`;
        try {
          await sendEmail({
            to: email,
            subject: "Reset your website admin password",
            html,
            text,
          });
        } catch (error) {
          console.error("Sending the password reset email failed:", (error as Error).message);
        }
      }
    }
  });

  await new Promise((resolve) => setTimeout(resolve, 400));
  return NextResponse.json({ ok: true, message: ANSWER });
}
