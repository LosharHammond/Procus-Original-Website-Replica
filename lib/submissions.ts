// Saves every website form submission so admins can read them in the admin panel,
// even if the notification email fails.
//
// Stored in the admin storage (see lib/storage.ts):
//   submissions/<id>.json        one entry per submission
//   submissions/files/<id>.pdf   the resume attached to a job application

import crypto from "crypto";
import { getJson, setJson, storage } from "@/lib/storage";

export type SubmissionForm = "contact" | "careers";

export type StoredSubmission = {
  id: string;
  form: SubmissionForm;
  receivedAt: string;
  /** Website page the form was sent from, e.g. "/brands/kivo". */
  page: string;
  fields: Record<string, string>;
  /** Original file name of the attached resume, if any. */
  resumeName?: string;
  read: boolean;
  /** Whether the notification email was sent successfully. */
  emailed: boolean;
};

const entryKey = (id: string) => `submissions/${id}.json`;
const resumeKey = (id: string) => `submissions/files/${id}.pdf`;

const ID = /^[0-9]{8}-[0-9]{6}-[a-f0-9]{8}$/;

function newId() {
  const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14); // YYYYMMDDHHMMSS
  return `${stamp.slice(0, 8)}-${stamp.slice(8)}-${crypto.randomBytes(4).toString("hex")}`;
}

export async function saveSubmission(input: {
  form: SubmissionForm;
  page: string;
  fields: Record<string, string>;
  resume?: { name: string; bytes: Buffer };
}): Promise<StoredSubmission> {
  const id = newId();
  if (input.resume) await storage().set(resumeKey(id), input.resume.bytes);
  const submission: StoredSubmission = {
    id,
    form: input.form,
    receivedAt: new Date().toISOString(),
    page: input.page,
    fields: input.fields,
    resumeName: input.resume?.name,
    read: false,
    emailed: false,
  };
  await setJson(entryKey(id), submission);
  return submission;
}

export async function getSubmission(id: string): Promise<StoredSubmission | null> {
  if (!ID.test(id)) return null;
  try {
    return await getJson<StoredSubmission>(entryKey(id));
  } catch {
    return null;
  }
}

export async function updateSubmission(id: string, changes: Partial<Pick<StoredSubmission, "read" | "emailed">>) {
  const current = await getSubmission(id);
  if (!current) return null;
  const next = { ...current, ...changes };
  await setJson(entryKey(id), next);
  return next;
}

export async function listSubmissions(): Promise<StoredSubmission[]> {
  const keys = await storage().list("submissions/");
  const items = await Promise.all(
    keys
      .filter((k) => k.endsWith(".json"))
      .map((k) => getSubmission(k.slice("submissions/".length, -".json".length))),
  );
  return items
    .filter((s): s is StoredSubmission => s !== null)
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

export async function deleteSubmission(id: string) {
  if (!ID.test(id)) return false;
  if (!(await getSubmission(id))) return false;
  await storage().delete(resumeKey(id)).catch(() => {});
  await storage().delete(entryKey(id));
  return true;
}

export async function readResume(id: string) {
  const submission = await getSubmission(id);
  if (!submission?.resumeName) return null;
  const bytes = await storage().get(resumeKey(id));
  return bytes ? { name: submission.resumeName, bytes } : null;
}
