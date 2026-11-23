// Sends website form emails from the company's own mailbox over SMTP
// (the same way an email app like Outlook sends mail). No third-party email service is involved.
//
// Settings (set them on the server, never in the code):
//   SMTP_HOST      mail server, e.g. smtp.zoho.com, smtp.gmail.com, mail.procusghana.com
//   SMTP_PORT      465 (SSL) or 587 (STARTTLS). Default 465.
//   SMTP_SECURE    optional, "true" for SSL or "false" for STARTTLS; only needed for unusual ports
//   SMTP_USER      the mailbox that sends, e.g. website@procusghana.com
//   SMTP_PASS      that mailbox's password, or an "app password" if the provider requires one
//   MAIL_FROM_NAME optional sender name. Default "Procus Ghana Website".
//   MAIL_TO        optional, who receives the forms. Default info@procusghana.com
//   MAIL_CC        optional, comma-separated addresses to copy. Default: no copies
//   SMTP_DEBUG     optional, set to 1 to log the conversation with the mail server when troubleshooting

import type { Transporter } from "nodemailer";
import { storage } from "@/lib/storage";

const DEFAULT_TO = "info@procusghana.com";
const DEFAULT_CC = "";

export function mailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

let transporter: Transporter | null = null;

async function getTransporter() {
  if (transporter) return transporter;
  // Loaded on first use. If the package isn't installed (run `npm install`), sending fails with a clear
  // error, but form submissions are still saved in the admin panel and the rest of the site keeps working.
  let nodemailer: typeof import("nodemailer");
  try {
    nodemailer = await import("nodemailer");
  } catch {
    throw new Error('The email library "nodemailer" is not installed. Run `npm install` in the project folder.');
  }
  const port = Number(process.env.SMTP_PORT || 465);
  // Port 465 uses SSL from the start; other ports upgrade with STARTTLS, which we require.
  // SMTP_SECURE=true/false overrides this for providers that use unusual ports.
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    requireTLS: !secure,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    // Set SMTP_DEBUG=1 to print the conversation with the mail server in the server log (passwords are hidden).
    logger: process.env.SMTP_DEBUG === "1",
    debug: process.env.SMTP_DEBUG === "1",
  });
  return transporter;
}

function list(value: string | undefined, fallback: string) {
  return (value ?? fallback)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function sendFormEmail(message: {
  subject: string;
  html: string;
  text: string;
  replyTo: { email: string; name: string };
  attachment?: { name: string; bytes: Buffer };
}) {
  const from = process.env.SMTP_USER!;
  const cc = list(process.env.MAIL_CC, DEFAULT_CC);
  await (await getTransporter()).sendMail({
    from: { name: process.env.MAIL_FROM_NAME || "Procus Ghana Website", address: from },
    to: list(process.env.MAIL_TO, DEFAULT_TO),
    cc: cc.length ? cc : undefined,
    replyTo: message.replyTo.name
      ? { name: message.replyTo.name, address: message.replyTo.email }
      : message.replyTo.email,
    subject: message.subject,
    html: message.html,
    text: message.text,
    attachments: message.attachment
      ? [{ filename: message.attachment.name, content: message.attachment.bytes, contentType: "application/pdf" }]
      : undefined,
  });
}

/** Where the notification emails go, for display in the admin panel. */
export function mailRecipient() {
  return list(process.env.MAIL_TO, DEFAULT_TO).join(", ");
}

/** Send a plain notification email (used for admin password reset links and alerts). */
export async function sendEmail(message: { to: string | string[]; subject: string; html: string; text: string }) {
  await (await getTransporter()).sendMail({
    from: { name: process.env.MAIL_FROM_NAME || "Procus Ghana Website", address: process.env.SMTP_USER! },
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text,
  });
}

/**
 * The website address used in emailed links. Fixed on the live site, so a forged request
 * can't make the site email a link pointing somewhere else.
 */
export function siteUrl(request: Request) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, "");
  if (process.env.NODE_ENV !== "production") return new URL(request.url).origin;
  // On Netlify, URL is the site's main address (its custom domain once one is connected).
  if (storage().kind === "netlify" && process.env.URL?.startsWith("https://")) return process.env.URL.replace(/\/+$/, "");
  return "https://procusghana.com";
}
