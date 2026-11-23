// Checks content sent by the admin panel before it is saved.
// Returns a list of human-readable problems; an empty list means it is OK to save.

import type { SiteContent } from "./types";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED_SLUGS = new Set(["admin", "api", "uploads"]);

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isImagePath(value: unknown) {
  return isString(value) && value.trim() !== "" && (value.startsWith("/") || /^https:\/\//.test(value));
}

export function validateContent(input: unknown): { ok: true; content: SiteContent } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const c = input as SiteContent;

  if (!c || typeof c !== "object") return { ok: false, errors: ["Nothing to save."] };
  if (!c.brandsPage || !isString(c.brandsPage.title) || !c.brandsPage.title.trim())
    errors.push("Brands page: the page title is required.");
  if (!c.eventsPage || !isString(c.eventsPage.title) || !c.eventsPage.title.trim())
    errors.push("Events and news page: the page title is required.");
  if (!Array.isArray(c.brands)) errors.push("Brands list is missing.");
  if (!Array.isArray(c.posts)) errors.push("Events and news list is missing.");
  if (!Array.isArray(c.ambassadors)) errors.push("Ambassadors list is missing.");
  if (!Array.isArray(c.featured) || !c.featured.every((f) => isString(f?.brand) && isString(f?.product)))
    errors.push("Featured products list is not valid.");
  if (errors.length) return { ok: false, errors };

  const brandSlugs = new Set<string>();
  c.brands.forEach((brand, bi) => {
    const where = `Brand "${brand?.name || `#${bi + 1}`}"`;
    if (!isString(brand.name) || !brand.name.trim()) errors.push(`${where}: name is required.`);
    if (!isString(brand.slug) || !SLUG.test(brand.slug) || RESERVED_SLUGS.has(brand.slug))
      errors.push(`${where}: web address must use only lowercase letters, numbers and dashes.`);
    else if (brandSlugs.has(brand.slug)) errors.push(`${where}: another brand already uses the web address "${brand.slug}".`);
    brandSlugs.add(brand.slug);
    if (!isImagePath(brand.logo)) errors.push(`${where}: a logo image is required.`);
    if (!isImagePath(brand.cover)) errors.push(`${where}: a cover image is required.`);
    if (!Array.isArray(brand.categories)) {
      errors.push(`${where}: categories are missing.`);
      return;
    }

    const productSlugs = new Set<string>();
    brand.categories.forEach((category, ci) => {
      const cwhere = `${where}, category "${category?.name || `#${ci + 1}`}"`;
      if (!isString(category.name) || !category.name.trim()) errors.push(`${cwhere}: category name is required.`);
      if (!Array.isArray(category.products)) {
        errors.push(`${cwhere}: products are missing.`);
        return;
      }
      category.products.forEach((product, pi) => {
        const pwhere = `${where}, product "${product?.name || `#${pi + 1}`}"`;
        if (!isString(product.name) || !product.name.trim()) errors.push(`${pwhere}: name is required.`);
        if (!isString(product.slug) || !SLUG.test(product.slug))
          errors.push(`${pwhere}: web address must use only lowercase letters, numbers and dashes.`);
        else if (productSlugs.has(product.slug))
          errors.push(`${pwhere}: another product in this brand already uses the web address "${product.slug}".`);
        productSlugs.add(product.slug);
        if (!isImagePath(product.image)) errors.push(`${pwhere}: a main image is required.`);
        if (product.images !== undefined && (!Array.isArray(product.images) || !product.images.every(isImagePath)))
          errors.push(`${pwhere}: one of the extra images is empty.`);
        if (!isString(product.sizes)) errors.push(`${pwhere}: sizes must be text.`);
      });
    });
  });

  const postSlugs = new Set<string>();
  c.posts.forEach((post, i) => {
    const where = `Post "${post?.title || `#${i + 1}`}"`;
    if (!isString(post.title) || !post.title.trim()) errors.push(`${where}: title is required.`);
    if (!isString(post.slug) || !SLUG.test(post.slug))
      errors.push(`${where}: web address must use only lowercase letters, numbers and dashes.`);
    else if (postSlugs.has(post.slug)) errors.push(`${where}: another post already uses the web address "${post.slug}".`);
    postSlugs.add(post.slug);
    if (post.date && !/^\d{4}-\d{2}-\d{2}$/.test(post.date)) errors.push(`${where}: date must look like 2026-11-18.`);
    if (!isImagePath(post.image)) errors.push(`${where}: an image is required.`);
    if (!Array.isArray(post.blocks)) errors.push(`${where}: article text is missing.`);
    else
      post.blocks.forEach((block, bi) => {
        if (!["text", "quote", "highlight"].includes(block?.type)) errors.push(`${where}: paragraph ${bi + 1} has an unknown type.`);
      });
  });

  c.ambassadors.forEach((person, i) => {
    const where = `Ambassador "${person?.name || `#${i + 1}`}"`;
    if (!isString(person.name) || !person.name.trim()) errors.push(`${where}: name is required.`);
    if (person.image && !isImagePath(person.image)) errors.push(`${where}: the photo path is not valid.`);
    if (person.link && !(person.link.startsWith("/") || /^https:\/\//.test(person.link)))
      errors.push(`${where}: the "Read more" link must start with / or https://`);
  });

  return errors.length ? { ok: false, errors } : { ok: true, content: c };
}
