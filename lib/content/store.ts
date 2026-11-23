// Admin-editable content and uploaded images, kept in the admin storage (see lib/storage.ts):
//   content.json          the current content
//   backups/*.json        the previous versions (last MAX_BACKUPS saves)
//   uploads/*             images uploaded from the admin panel, served at /uploads/<name>
//
// The storage lives outside the code, so deploying a new version never overwrites the admin's edits.

import path from "path";
import crypto from "crypto";
import { buildSeedContent } from "./seed";
import type { SiteContent } from "./types";
import { getJson, setJson, storage } from "@/lib/storage";

export { contentDir } from "@/lib/storage";

const MAX_BACKUPS = 30;
const CONTENT_KEY = "content.json";

export async function getContent(): Promise<SiteContent> {
  const stored = await getJson<Partial<SiteContent>>(CONTENT_KEY);
  // Sections added in later versions of the site are filled in from the starting content.
  return stored ? ({ ...buildSeedContent(), ...stored } as SiteContent) : buildSeedContent();
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

  const store = storage();
  // Keep the previous version as a backup.
  const previous = await store.get(CONTENT_KEY);
  if (previous) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    await store.set(`backups/content-${stamp}.json`, previous);
    const backups = (await store.list("backups/")).filter((k) => k.endsWith(".json")).sort();
    for (const old of backups.slice(0, Math.max(0, backups.length - MAX_BACKUPS))) {
      await store.delete(old).catch(() => {});
    }
  }

  const saved: SiteContent = { ...next, version: 1, updatedAt: new Date().toISOString() };
  await setJson(CONTENT_KEY, saved);
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
  await storage().set(`uploads/${name}`, data);
  return `/uploads/${name}`;
}

/** Read an uploaded image by its file name (no ../ tricks). Returns null if not found. */
export async function readUpload(name: string) {
  if (!/^[a-z0-9-]+\.[a-z0-9]+$/.test(name)) return null;
  const type = IMAGE_TYPES[path.extname(name).toLowerCase()];
  if (!type) return null;
  const data = await storage().get(`uploads/${name}`);
  return data ? { data, type } : null;
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
