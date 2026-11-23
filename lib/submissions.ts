// Saves every website form submission so admins can read them in the admin panel,
// even if the notification email fails.
//
// Stored in the same folder as the admin content (CONTENT_DIR):
//   submissions/<id>.json        one file per submission
//   submissions/files/<id>.pdf   the resume attached to a job application

import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { contentDir } from "@/lib/content/store";

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

function submissionsDir() {
  return path.join(contentDir(), "submissions");
}

function filesDir() {
  return path.join(submissionsDir(), "files");
}

const ID = /^[0-9]{8}-[0-9]{6}-[a-f0-9]{8}$/;

function newId() {
  const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14); // YYYYMMDDHHMMSS
  return `${stamp.slice(0, 8)}-${stamp.slice(8)}-${crypto.randomBytes(4).toString("hex")}`;
}

async function writeJson(file: string, data: unknown) {
  const tmp = `${file}.${crypto.randomBytes(4).toString("hex")}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, file);
}

export async function saveSubmission(input: {
  form: SubmissionForm;
  page: string;
  fields: Record<string, string>;
  resume?: { name: string; bytes: Buffer };
}): Promise<StoredSubmission> {
  await fs.mkdir(filesDir(), { recursive: true });
  const id = newId();
  if (input.resume) await fs.writeFile(path.join(filesDir(), `${id}.pdf`), input.resume.bytes);
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
  await writeJson(path.join(submissionsDir(), `${id}.json`), submission);
  return submission;
}

export async function getSubmission(id: string): Promise<StoredSubmission | null> {
  if (!ID.test(id)) return null;
  try {
    return JSON.parse(await fs.readFile(path.join(submissionsDir(), `${id}.json`), "utf8")) as StoredSubmission;
  } catch {
    return null;
  }
}

export async function updateSubmission(id: string, changes: Partial<Pick<StoredSubmission, "read" | "emailed">>) {
  const current = await getSubmission(id);
  if (!current) return null;
  const next = { ...current, ...changes };
  await writeJson(path.join(submissionsDir(), `${id}.json`), next);
  return next;
}

export async function listSubmissions(): Promise<StoredSubmission[]> {
  let names: string[];
  try {
    names = await fs.readdir(submissionsDir());
  } catch {
    return [];
  }
  const items = await Promise.all(
    names
      .filter((n) => n.endsWith(".json"))
      .map((n) => getSubmission(n.replace(/\.json$/, ""))),
  );
  return items
    .filter((s): s is StoredSubmission => s !== null)
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

export async function deleteSubmission(id: string) {
  if (!ID.test(id)) return false;
  await fs.unlink(path.join(filesDir(), `${id}.pdf`)).catch(() => {});
  try {
    await fs.unlink(path.join(submissionsDir(), `${id}.json`));
    return true;
  } catch {
    return false;
  }
}

export async function readResume(id: string) {
  const submission = await getSubmission(id);
  if (!submission?.resumeName) return null;
  try {
    return { name: submission.resumeName, bytes: await fs.readFile(path.join(filesDir(), `${id}.pdf`)) };
  } catch {
    return null;
  }
}
