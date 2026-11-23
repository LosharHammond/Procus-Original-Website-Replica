// Server-side storage for admin-editable content and uploaded images.
//
// Everything is kept in one folder on the server (CONTENT_DIR, default ./storage):
//   content.json          the current content
//   backups/*.json        the previous versions (last MAX_BACKUPS saves)
//   uploads/*             images uploaded from the admin panel, served at /uploads/<name>
//
// Keep CONTENT_DIR outside the code folder (or at least out of git) so that
// deploying a new version of the code never overwrites the admin's edits.

import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { buildSeedContent } from "./seed";
import type { SiteContent } from "./types";

const MAX_BACKUPS = 30;

export function contentDir() {
  return path.resolve(/*turbopackIgnore: true*/ process.env.CONTENT_DIR || path.join(process.cwd(), "storage"));
}

function contentFile() {
  return path.join(contentDir(), "content.json");
}

export function uploadsDir() {
  return path.join(contentDir(), "uploads");
}

export async function getContent(): Promise<SiteContent> {
  try {
    const raw = await fs.readFile(contentFile(), "utf8");
    // Sections added in later versions of the site are filled in from the starting content.
    return { ...buildSeedContent(), ...(JSON.parse(raw) as Partial<SiteContent>) } as SiteContent;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return buildSeedContent();
    throw error;
  }
}

export class ConflictError extends Error {}

/**
 * Save new content. `expectedUpdatedAt` must match the stored version, so an
 * admin working from an old copy can't silently overwrite someone else's edits.
 */
export async function saveContent(next: SiteContent, expectedUpdatedAt: string): Promise<SiteContent> {
  const current = await getContent();
  if (current.updatedAt !== expectedUpdatedAt) {
    throw new ConflictError("The content was changed by someone else since you opened it.");
  }

  const dir = contentDir();
  await fs.mkdir(path.join(dir, "backups"), { recursive: true });

  // Keep the previous version as a backup.
  try {
    const previous = await fs.readFile(contentFile(), "utf8");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    await fs.writeFile(path.join(dir, "backups", `content-${stamp}.json`), previous);
    const backups = (await fs.readdir(path.join(dir, "backups"))).filter((f) => f.endsWith(".json")).sort();
    for (const old of backups.slice(0, Math.max(0, backups.length - MAX_BACKUPS))) {
      await fs.unlink(path.join(dir, "backups", old)).catch(() => {});
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  const saved: SiteContent = { ...next, version: 1, updatedAt: new Date().toISOString() };
  // Write to a temp file and rename, so a crash mid-write can't leave a broken file.
  const tmp = `${contentFile()}.${crypto.randomBytes(4).toString("hex")}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(saved, null, 2));
  await fs.rename(tmp, contentFile());
  return saved;
}

export const IMAGE_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

/** Store an uploaded image and return its public URL. */
export async function saveUpload(fileName: string, data: Buffer): Promise<string> {
  const ext = path.extname(fileName).toLowerCase();
  if (!IMAGE_TYPES[ext]) throw new Error("Only PNG, JPG, WEBP, GIF, AVIF or SVG images can be uploaded.");
  if (data.byteLength > MAX_UPLOAD_BYTES) throw new Error("Images must be 15 MB or smaller.");

  const base =
    path
      .basename(fileName, path.extname(fileName))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "image";
  const name = `${base}-${crypto.randomBytes(4).toString("hex")}${ext}`;
  await fs.mkdir(uploadsDir(), { recursive: true });
  await fs.writeFile(path.join(uploadsDir(), name), data);
  return `/uploads/${name}`;
}

/** Resolve an uploaded file name safely (no ../ tricks). Returns null if invalid. */
export function resolveUpload(name: string) {
  if (!/^[a-z0-9-]+\.[a-z0-9]+$/.test(name)) return null;
  const ext = path.extname(name).toLowerCase();
  const type = IMAGE_TYPES[ext];
  if (!type) return null;
  return { filePath: path.join(uploadsDir(), name), type };
}

// ---------- read helpers for the public pages ----------

export async function getBrandContent(slug: string) {
  const content = await getContent();
  return content.brands.find((b) => b.slug === slug);
}

/** The homepage featured products, skipping any that have since been deleted. */
export function resolveFeatured(content: SiteContent) {
  return content.featured.flatMap((ref) => {
    const brand = content.brands.find((b) => b.slug === ref.brand);
    const product = brand?.categories.flatMap((c) => c.products).find((p) => p.slug === ref.product);
    return brand && product ? [{ brandSlug: brand.slug, product }] : [];
  });
}

export async function getProductContent(brandSlug: string, productSlug: string) {
  const brand = await getBrandContent(brandSlug);
  if (!brand) return undefined;
  for (const category of brand.categories) {
    const product = category.products.find((p) => p.slug === productSlug);
    if (product) return { brand, product };
  }
  return undefined;
}
