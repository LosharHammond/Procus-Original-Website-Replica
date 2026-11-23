import { NextResponse } from "next/server";
import { saveSubmission, updateSubmission, type StoredSubmission } from "@/lib/submissions";
import { mailConfigured, sendFormEmail } from "@/lib/mailer";

export const runtime = "nodejs";

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

/** The website page the form was sent from, taken from the Referer header (same site only). */
function pageFromReferer(request: Request, host: string) {
  try {
    const referer = new URL(request.headers.get("referer") ?? "");
    return referer.host === host ? referer.pathname.slice(0, 200) : "";
  } catch {
    return "";
  }
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const requestHost = forwardedHost || request.headers.get("host") || new URL(request.url).host;
  if (origin) {
    try {
      if (new URL(origin).host !== requestHost) {
        return jsonError("This form request is not allowed.", 403);
      }
    } catch {
      return jsonError("This form request is not allowed.", 403);
    }
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
  let resumeBytes: Buffer | undefined;
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
    resumeBytes = bytes;
  }

  // Save the submission first, so it shows in the admin panel even if the email fails.
  let saved: StoredSubmission | null = null;
  try {
    saved = await saveSubmission({
      form: formName,
      page: pageFromReferer(request, requestHost),
      fields,
      resume: attachment && resumeBytes ? { name: attachment.name, bytes: resumeBytes } : undefined,
    });
  } catch (error) {
    console.error("Could not save form submission", error);
  }

  if (!mailConfigured()) {
    if (saved) return NextResponse.json({ accepted: true });
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
    // Sent from the company's own mailbox over SMTP (see lib/mailer.ts).
    await sendFormEmail({
      subject,
      html: htmlContent,
      text: textContent,
      replyTo: {
        email: fields.email,
        name: fields.name || `${fields.first_name || ""} ${fields.last_name || ""}`.trim(),
      },
      attachment: attachment && resumeBytes ? { name: attachment.name, bytes: resumeBytes } : undefined,
    });
    if (saved) await updateSubmission(saved.id, { emailed: true }).catch(() => {});
    return NextResponse.json({ accepted: true });
  } catch (error) {
    console.error("Sending the form email failed:", (error as Error).message);
    // The message is safely stored in the admin panel, so the visitor does not need to resend it.
    if (saved) return NextResponse.json({ accepted: true });
    return jsonError("The email could not be sent. Please try again later.", 502);
  }
}
