// Where the admin panel keeps everything it saves: content, backups, uploaded images,
// form submissions and the admin account.
//
// Two places, picked automatically:
//   - On Netlify: Netlify Blobs (Netlify's built-in storage). Netlify doesn't let a site
//     write files to its own disk, and anything written there would vanish on the next deploy.
//   - Anywhere else (your PC, a normal server): files in the storage folder
//     (CONTENT_DIR, default ./storage).
//
// Set STORAGE=files or STORAGE=netlify to force one of them.

import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export interface Storage {
  readonly kind: "files" | "netlify";
  get(key: string): Promise<Buffer | null>;
  set(key: string, data: Buffer | string): Promise<void>;
  delete(key: string): Promise<void>;
  /** Keys directly inside a "folder", e.g. list("backups/") → ["backups/a.json", ...]. */
  list(prefix: string): Promise<string[]>;
}

export function contentDir() {
  return path.resolve(/*turbopackIgnore: true*/ process.env.CONTENT_DIR || path.join(process.cwd(), "storage"));
}

const SAFE_KEY = /^[a-z0-9._-]+(?:\/[a-z0-9._-]+)*$/i;

function checkKey(key: string) {
  if (!SAFE_KEY.test(key) || key.split("/").some((part) => part === ".." || part === ".")) {
    throw new Error(`Invalid storage key: ${key}`);
  }
}

// ---------- files on disk ----------

const fileStorage: Storage = {
  kind: "files",
  async get(key) {
    checkKey(key);
    try {
      return await fs.readFile(path.join(contentDir(), key));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw error;
    }
  },
  async set(key, data) {
    checkKey(key);
    const file = path.join(contentDir(), key);
    await fs.mkdir(path.dirname(file), { recursive: true });
    // Write to a temp file and rename, so a crash mid-write can't leave a broken file.
    const tmp = `${file}.${crypto.randomBytes(4).toString("hex")}.tmp`;
    await fs.writeFile(tmp, data, { mode: 0o600 });
    await fs.rename(tmp, file);
  },
  async delete(key) {
    checkKey(key);
    await fs.unlink(path.join(contentDir(), key)).catch(() => {});
  },
  async list(prefix) {
    const dir = path.join(contentDir(), prefix);
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      return entries.filter((e) => e.isFile() && !e.name.endsWith(".tmp")).map((e) => `${prefix}${e.name}`);
    } catch {
      return [];
    }
  },
};

// ---------- Netlify Blobs ----------

type BlobStore = import("@netlify/blobs").Store;
let blobStorePromise: Promise<BlobStore> | null = null;

// Inside Next.js, the Blobs library hangs when it cancels the body of a reply it doesn't need
// (for example "not found"). Reading every reply in full first means there is nothing to cancel.
// Our blobs are small (images are capped at 15 MB), so this costs nothing noticeable.
async function bufferedFetch(input: RequestInfo | URL, init?: RequestInit) {
  const wrapped = globalThis.fetch as typeof fetch & { _nextOriginalFetch?: typeof fetch };
  const res = await (wrapped._nextOriginalFetch ?? wrapped)(input, init);
  const body = res.status === 204 || res.status === 304 || init?.method === "HEAD" ? null : await res.arrayBuffer();
  return new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers });
}

function blobStore() {
  blobStorePromise ??= import("@netlify/blobs").then(({ getStore }) =>
    // "strong" so an admin sees their own change straight after saving.
    getStore({ name: "procus-admin", consistency: "strong", fetch: bufferedFetch }),
  );
  return blobStorePromise;
}

const netlifyStorage: Storage = {
  kind: "netlify",
  async get(key) {
    checkKey(key);
    const data = await (await blobStore()).get(key, { type: "arrayBuffer" });
    return data ? Buffer.from(data) : null;
  },
  async set(key, data) {
    checkKey(key);
    const body = typeof data === "string" ? data : data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    await (await blobStore()).set(key, body as string | ArrayBuffer);
  },
  async delete(key) {
    checkKey(key);
    await (await blobStore()).delete(key);
  },
  async list(prefix) {
    const { blobs } = await (await blobStore()).list({ prefix });
    // Only direct children, like a folder listing.
    return blobs.map((b) => b.key).filter((key) => !key.slice(prefix.length).includes("/"));
  },
};

function onNetlify() {
  const g = globalThis as { netlifyBlobsContext?: unknown };
  return Boolean(g.netlifyBlobsContext || process.env.NETLIFY_BLOBS_CONTEXT);
}

export function storage(): Storage {
  const forced = process.env.STORAGE?.toLowerCase();
  if (forced === "files") return fileStorage;
  if (forced === "netlify" || onNetlify()) return netlifyStorage;
  return fileStorage;
}

export async function getJson<T>(key: string): Promise<T | null> {
  const data = await storage().get(key);
  return data ? (JSON.parse(data.toString("utf8")) as T) : null;
}

export async function setJson(key: string, value: unknown) {
  await storage().set(key, JSON.stringify(value, null, 2));
}
