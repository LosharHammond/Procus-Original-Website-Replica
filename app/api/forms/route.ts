import { NextResponse } from "next/server";

export const runtime = "nodejs";

const RECIPIENT = "Skthakur10@gmail.com";
const CC_RECIPIENT = "hammond@procusghana.com";
const MAX_FILE_BYTES = 500 * 1024;
const MAX_REQUEST_BYTES = 900 * 1024;

type FormName = "contact" | "careers";
type Submission = {
  formName?: unknown;
  fields?: unknown;
  honeypot?: unknown;
  attachment?: unknown;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ accepted: false, message }, { status });
}

function escapeHtml(value: string) {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return value.replace(/[&<>"']/g, (character) => entities[character]);
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return jsonError("This form request is not allowed.", 403);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_REQUEST_BYTES) return jsonError("The submission is too large.", 413);

  let body: Submission;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) {
      return jsonError("The submission is too large.", 413);
    }
    body = JSON.parse(rawBody) as Submission;
  } catch {
    return jsonError("The submission could not be read. Please try again.", 400);
  }

  // Silently accept honeypot submissions so basic bots do not learn the trap.
  if (typeof body.honeypot === "string" && body.honeypot.trim()) {
    return NextResponse.json({ accepted: true });
  }

  if (body.formName !== "contact" && body.formName !== "careers") {
    return jsonError("This form is not recognized.", 400);
  }
  const formName: FormName = body.formName;
  if (!body.fields || typeof body.fields !== "object" || Array.isArray(body.fields)) {
    return jsonError("Please complete the form and try again.", 400);
  }

  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(body.fields as Record<string, unknown>)) {
    if (typeof value !== "string") continue;
    const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 60);
    if (!safeKey) continue;
    if (value.length > 10_000) return jsonError("One of the form fields is too long.", 400);
    fields[safeKey] = value.trim();
  }

  const requiredFields = formName === "contact"
    ? ["first_name", "last_name", "email", "phone", "message"]
    : ["name", "specialisation", "email", "phone"];
  if (requiredFields.some((key) => !fields[key])) {
    return jsonError("Please complete all required fields.", 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    return jsonError("Please enter a valid email address.", 400);
  }

  let attachment: { name: string; content: string } | undefined;
  if (body.attachment !== undefined && body.attachment !== null) {
    if (formName !== "careers" || typeof body.attachment !== "object") {
      return jsonError("This file cannot be attached to this form.", 400);
    }
    const candidate = body.attachment as Record<string, unknown>;
    if (typeof candidate.name !== "string" || typeof candidate.content !== "string") {
      return jsonError("The resume file could not be read. Please choose it again.", 400);
    }
    const name = candidate.name.split(/[\\/]/).pop()?.replace(/[^a-zA-Z0-9._-]/g, "_") || "resume.pdf";
    const content = candidate.content;
    if (!name.toLowerCase().endsWith(".pdf") || !content || !/^[A-Za-z0-9+/]+={0,2}$/.test(content)) {
      return jsonError("Only PDF resumes are accepted.", 400);
    }
    const bytes = Buffer.from(content, "base64");
    if (bytes.byteLength > MAX_FILE_BYTES) return jsonError("The resume must be under 500KB.", 413);
    if (bytes.byteLength < 5 || bytes.subarray(0, 5).toString("ascii") !== "%PDF-") {
      return jsonError("The selected file is not a valid PDF.", 400);
    }
    attachment = { name, content: bytes.toString("base64") };
  }

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!apiKey || !senderEmail) {
    return jsonError("Email delivery is not configured yet. Please try again later.", 503);
  }

  const subject = formName === "careers"
    ? "New career application from the Procus website"
    : "New enquiry from the Procus website";
  const rows = Object.entries(fields);
  const htmlContent = [
    `<h2>${escapeHtml(subject)}</h2>`,
    `<p>Submitted from the Procus Ghana website on ${escapeHtml(new Date().toISOString())}.</p>`,
    "<table cellpadding=\"8\" cellspacing=\"0\" style=\"border-collapse:collapse\">",
    ...rows.map(([key, value]) => {
      const label = key.replace(/[_-]/g, " ");
      return `<tr><th align=\"left\">${escapeHtml(label)}</th><td>${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`;
    }),
    "</table>",
  ].join("");
  const textContent = [
    subject,
    "",
    ...rows.map(([key, value]) => `${key.replace(/[_-]/g, " ")}:\n${value}`),
  ].join("\n\n");

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME || "Procus Ghana Website",
          email: senderEmail,
        },
        to: [{ email: RECIPIENT }],
        cc: [{ email: CC_RECIPIENT }],
        replyTo: {
          email: fields.email,
          name: fields.name || `${fields.first_name || ""} ${fields.last_name || ""}`.trim(),
        },
        subject,
        htmlContent,
        textContent,
        ...(attachment ? { attachment: [attachment] } : {}),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      console.error("Brevo rejected form email with status", response.status);
      return jsonError(
        response.status === 429
          ? "The email service is temporarily busy. Please try again shortly."
          : "The email service could not accept your submission. Please try again later.",
        response.status === 429 ? 429 : 502,
      );
    }

    return NextResponse.json({ accepted: true });
  } catch {
    return jsonError("The email service could not be reached. Please try again later.", 502);
  }
}
