import { after } from "next/server";
import { getRecoveryEmails } from "@/lib/adminAccount";
import { mailConfigured, sendEmail } from "@/lib/mailer";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Tell every recovery address that the admin password was changed, so a change can't go unnoticed. */
export function alertPasswordChanged(how: string, siteUrl: string) {
  if (!mailConfigured()) return;
  const when = new Date().toUTCString();
  const text = [
    "The admin password for the Procus Ghana website was just changed.",
    "",
    `How: ${how}`,
    `When: ${when}`,
    "",
    `If this wasn't you or someone on your team, reset the password now: ${siteUrl}/admin (choose "Forgot password?").`,
  ].join("\n");
  const html = `<p>The admin password for the Procus Ghana website was just changed.</p>
<p><strong>How:</strong> ${escapeHtml(how)}<br><strong>When:</strong> ${escapeHtml(when)}</p>
<p>If this wasn't you or someone on your team, <a href="${siteUrl}/admin">reset the password now</a> (choose "Forgot password?").</p>`;
  // Sent after the reply, but the server keeps running until it's done (needed on Netlify).
  after(async () => {
    try {
      await sendEmail({ to: await getRecoveryEmails(), subject: "Your website admin password was changed", html, text });
    } catch (error) {
      console.error("Sending the password-change alert failed:", (error as Error).message);
    }
  });
}
