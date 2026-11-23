"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AmbassadorContent, BrandContent, PostBlock, PostContent, ProductContent, SiteContent } from "@/lib/content/types";
import SubmissionsPanel from "./SubmissionsPanel";
import AccountPanel from "./AccountPanel";
import {
  ConfirmButton,
  ImageField,
  MoveButtons,
  SlugField,
  TextArea,
  TextField,
  move,
  slugify,
} from "./fields";
import styles from "./admin.module.css";

type Section =
  | { kind: "submissions" }
  | { kind: "account" }
  | { kind: "featured" }
  | { kind: "ambassadors" }
  | { kind: "brandsPage" }
  | { kind: "brand"; index: number }
  | { kind: "eventsPage" }
  | { kind: "post"; index: number };

type Updater = (draft: SiteContent) => void;

/** Drop homepage featured entries whose product no longer exists (after a delete). */
function pruneFeatured(d: SiteContent) {
  d.featured = d.featured.filter((f) =>
    d.brands.some((b) => b.slug === f.brand && b.categories.some((c) => c.products.some((p) => p.slug === f.product))),
  );
}

/** Web addresses that are already live. Renaming those items must not change their address. */
type LiveSlugs = { brands: Set<string>; products: Set<string>; posts: Set<string> };

function liveSlugsOf(savedJson: string): LiveSlugs {
  const saved = savedJson ? (JSON.parse(savedJson) as SiteContent) : null;
  return {
    brands: new Set(saved?.brands.map((b) => b.slug) ?? []),
    products: new Set(saved?.brands.flatMap((b) => b.categories.flatMap((c) => c.products.map((p) => `${b.slug}/${p.slug}`))) ?? []),
    posts: new Set(saved?.posts.map((p) => p.slug) ?? []),
  };
}

export default function AdminApp() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [savedJson, setSavedJson] = useState("");
  const [section, setSection] = useState<Section>({ kind: "submissions" });
  const [unread, setUnread] = useState<number | null>(null);
  const [status, setStatus] = useState<{ type: "ok" | "error"; text: string; details?: string[] } | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  const load = useCallback(async () => {
    setLoadError("");
    const response = await fetch("/api/admin/content", { cache: "no-store" });
    if (response.status === 401) {
      window.location.reload();
      return;
    }
    if (!response.ok) {
      setLoadError("Could not load the website content. Please refresh the page.");
      return;
    }
    const data = (await response.json()) as SiteContent;
    setContent(data);
    setSavedJson(JSON.stringify(data));
  }, []);

  useEffect(() => {
    // Loading the content from the server once is the external sync this effect is for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load().catch(() => setLoadError("Could not reach the server. Please refresh the page."));
    fetch("/api/admin/submissions", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((list: { read: boolean }[]) => setUnread(list.filter((s) => !s.read).length))
      .catch(() => {});
  }, [load]);

  const dirty = content !== null && JSON.stringify(content) !== savedJson;

  // On phones the menu sits above the editor, so jump down to the editor after choosing a section.
  const go = useCallback((next: Section) => {
    setSection(next);
    if (window.innerWidth <= 800) {
      requestAnimationFrame(() => document.getElementById("admin-main")?.scrollIntoView({ behavior: "smooth" }));
    }
  }, []);
  const live = useMemo(() => liveSlugsOf(savedJson), [savedJson]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = useCallback((fn: Updater) => {
    setContent((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
    setStatus(null);
  }, []);

  async function save() {
    if (!content) return;
    setSaving(true);
    setStatus(null);
    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, expectedUpdatedAt: content.updatedAt }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        setStatus({ type: "error", text: "Your login has expired. Open the admin panel in a new tab, log in, then save here again." });
        return;
      }
      if (!response.ok) {
        setStatus({ type: "error", text: data.error || "Saving failed.", details: data.details });
        return;
      }
      setContent(data);
      setSavedJson(JSON.stringify(data));
      setStatus({ type: "ok", text: "Saved. The website is updated." });
    } catch {
      setStatus({ type: "error", text: "Could not reach the server. Your changes are still here; try saving again." });
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    setContent(JSON.parse(savedJson));
    setStatus(null);
  }

  async function logout() {
    if (dirty && !window.confirm("You have unsaved changes. Log out anyway?")) return;
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  }

  if (loadError) return <div className={styles.centerScreen}><p className={styles.error}>{loadError}</p></div>;
  if (!content) return <div className={styles.centerScreen}><p>Loading…</p></div>;

  const isActive = (s: Section) =>
    s.kind === section.kind && ("index" in s ? "index" in section && s.index === section.index : true);

  return (
    <div className={styles.shell}>
      <header className={styles.topBar}>
        <div className={styles.brandMark}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo/procus-logo.svg" alt="" width={44} height={30} />
          <strong>Website admin</strong>
        </div>
        <div className={styles.topActions}>
          <span className={dirty ? styles.unsaved : styles.savedNote}>{dirty ? "Unsaved changes" : "All changes saved"}</span>
          {dirty ? (
            <button type="button" className={styles.linkButton} onClick={discard}>
              Discard changes
            </button>
          ) : null}
          <button type="button" className={styles.primaryButton} onClick={save} disabled={!dirty || saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
          <a href="/" target="_blank" rel="noreferrer" className={styles.secondaryButton}>
            View website
          </a>
          <button type="button" className={styles.linkButton} onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      {status ? (
        <div className={status.type === "ok" ? styles.successBanner : styles.errorBanner} role="status">
          <p>{status.text}</p>
          {status.details?.length ? (
            <ul>
              {status.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className={styles.body}>
        <nav className={styles.sidebar} aria-label="Admin sections">
          <p className={styles.sidebarTitle}>Inbox</p>
          <button
            type="button"
            className={isActive({ kind: "submissions" }) ? styles.navActive : styles.navItem}
            onClick={() => go({ kind: "submissions" })}
          >
            <span className={styles.navWithBadge}>
              Form submissions
              {unread ? <span className={styles.countBadge}>{unread} new</span> : null}
            </span>
          </button>

          <p className={styles.sidebarTitle}>Homepage</p>
          <button
            type="button"
            className={isActive({ kind: "featured" }) ? styles.navActive : styles.navItem}
            onClick={() => go({ kind: "featured" })}
          >
            Featured products
            <small>{content.featured.length} products</small>
          </button>
          <button
            type="button"
            className={isActive({ kind: "ambassadors" }) ? styles.navActive : styles.navItem}
            onClick={() => go({ kind: "ambassadors" })}
          >
            Brand ambassadors
            <small>{content.ambassadors.length} people</small>
          </button>

          <p className={styles.sidebarTitle}>Brands</p>
          <button
            type="button"
            className={isActive({ kind: "brandsPage" }) ? styles.navActive : styles.navItem}
            onClick={() => go({ kind: "brandsPage" })}
          >
            Brands page text
          </button>
          {content.brands.map((brand, index) => (
            <button
              type="button"
              key={index}
              className={isActive({ kind: "brand", index }) ? styles.navActive : styles.navItem}
              onClick={() => go({ kind: "brand", index })}
            >
              {brand.name || "Untitled brand"}
              <small>{brand.categories.reduce((n, c) => n + c.products.length, 0)} products</small>
            </button>
          ))}
          <button
            type="button"
            className={styles.navAdd}
            onClick={() => {
              update((d) => {
                d.brands.push({ slug: "", name: "", logo: "", cover: "", tagline: "", description: "", categories: [{ name: "Products", products: [] }] });
              });
              go({ kind: "brand", index: content.brands.length });
            }}
          >
            + Add brand
          </button>

          <p className={styles.sidebarTitle}>Events and news</p>
          <button
            type="button"
            className={isActive({ kind: "eventsPage" }) ? styles.navActive : styles.navItem}
            onClick={() => go({ kind: "eventsPage" })}
          >
            Page text
          </button>
          {content.posts.map((post, index) => (
            <button
              type="button"
              key={index}
              className={isActive({ kind: "post", index }) ? styles.navActive : styles.navItem}
              onClick={() => go({ kind: "post", index })}
            >
              {post.title || "Untitled post"}
              <small>{post.published ? post.label || "Published" : "Hidden (draft)"}</small>
            </button>
          ))}
          <button
            type="button"
            className={styles.navAdd}
            onClick={() => {
              update((d) => {
                d.posts.unshift({
                  slug: "",
                  label: "News",
                  title: "",
                  date: new Date().toISOString().slice(0, 10),
                  image: "",
                  imageAlt: "",
                  summary: "",
                  blocks: [{ type: "text", text: "" }],
                  published: false,
                });
              });
              go({ kind: "post", index: 0 });
            }}
          >
            + Add event or news
          </button>

          <p className={styles.sidebarTitle}>Account</p>
          <button
            type="button"
            className={isActive({ kind: "account" }) ? styles.navActive : styles.navItem}
            onClick={() => go({ kind: "account" })}
          >
            Password &amp; recovery
          </button>
        </nav>

        <main className={styles.main} id="admin-main">
          {section.kind === "submissions" ? <SubmissionsPanel onUnreadChange={setUnread} /> : null}
          {section.kind === "account" ? <AccountPanel /> : null}
          {section.kind === "ambassadors" ? <AmbassadorsEditor content={content} update={update} /> : null}
          {section.kind === "featured" ? <FeaturedEditor content={content} update={update} /> : null}
          {section.kind === "brandsPage" ? <BrandsPageEditor content={content} update={update} /> : null}
          {section.kind === "brand" && content.brands[section.index] ? (
            <BrandEditor
              key={section.index}
              brand={content.brands[section.index]}
              featured={content.featured}
              index={section.index}
              count={content.brands.length}
              live={live}
              update={update}
              onMoved={(to) => setSection({ kind: "brand", index: to })}
              onDeleted={() => setSection({ kind: "brandsPage" })}
            />
          ) : null}
          {section.kind === "eventsPage" ? <EventsPageEditor content={content} update={update} /> : null}
          {section.kind === "post" && content.posts[section.index] ? (
            <PostEditor
              key={section.index}
              post={content.posts[section.index]}
              index={section.index}
              count={content.posts.length}
              live={live}
              update={update}
              onMoved={(to) => setSection({ kind: "post", index: to })}
              onDeleted={() => setSection({ kind: "eventsPage" })}
            />
          ) : null}
          {section.kind !== "submissions" && section.kind !== "account" ? (
            <p className={styles.footNote}>
              Changes appear on the website only after you click <strong>Save changes</strong>.
            </p>
          ) : null}
        </main>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- featured products

function FeaturedEditor({ content, update }: { content: SiteContent; update: (fn: Updater) => void }) {
  const all = content.brands.flatMap((brand) =>
    brand.categories.flatMap((category) => category.products.map((product) => ({ brand, product }))),
  );
  const find = (ref: { brand: string; product: string }) =>
    all.find((x) => x.brand.slug === ref.brand && x.product.slug === ref.product);
  const isFeatured = (brand: string, product: string) =>
    content.featured.some((f) => f.brand === brand && f.product === product);

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <h1>Featured products</h1>
        <a href="/" target="_blank" rel="noreferrer" className={styles.linkButton}>
          View homepage ↗
        </a>
      </div>
      <p className={styles.hint}>
        These products appear as tabs under &ldquo;Featured Products&rdquo; on the homepage, in this order. Their
        name, picture and description come from the product itself (edit it under its brand).
      </p>

      {content.featured.length === 0 ? <p className={styles.hint}>No featured products. The section is hidden on the homepage.</p> : null}
      <ul className={styles.productList}>
        {content.featured.map((ref, i) => {
          const found = find(ref);
          return (
            <li key={`${ref.brand}/${ref.product}`} className={styles.productRow}>
              <div className={styles.productSummary}>
                <div className={styles.thumb}>
                  {found?.product.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={found.product.image} alt="" />
                  ) : null}
                </div>
                <div className={styles.productTitle}>
                  <strong>{found ? found.product.name : "Product no longer exists"}</strong>
                  <small>{found ? found.brand.name : `${ref.brand}/${ref.product} — remove it from this list`}</small>
                </div>
                <div className={styles.rowActions}>
                  <MoveButtons index={i} length={content.featured.length} label="featured product" onMove={(from, to) => update((d) => void (d.featured = move(d.featured, from, to)))} />
                  <button type="button" className={styles.dangerButton} onClick={() => update((d) => void d.featured.splice(i, 1))}>
                    Remove
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <label className={styles.field}>
        <span>Add a product</span>
        <select
          className={styles.moveSelect}
          value=""
          onChange={(e) => {
            const [brand, product] = e.target.value.split("|");
            if (brand && product) update((d) => void d.featured.push({ brand, product }));
          }}
        >
          <option value="">Choose a product…</option>
          {content.brands.map((brand) => (
            <optgroup key={brand.slug} label={brand.name}>
              {brand.categories
                .flatMap((c) => c.products)
                .filter((p) => p.slug && !isFeatured(brand.slug, p.slug))
                .map((p) => (
                  <option key={p.slug} value={`${brand.slug}|${p.slug}`}>
                    {p.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </label>
    </section>
  );
}

// ---------------------------------------------------------------- ambassadors

function AmbassadorsEditor({ content, update }: { content: SiteContent; update: (fn: Updater) => void }) {
  const list = content.ambassadors;
  const set = (i: number, fn: (a: AmbassadorContent) => void) => update((d) => fn(d.ambassadors[i]));

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <h1>Brand ambassadors</h1>
        <a href="/" target="_blank" rel="noreferrer" className={styles.linkButton}>
          View homepage ↗
        </a>
      </div>
      <p className={styles.hint}>
        Shown on the homepage and the brands page under &ldquo;Our Brand Ambassadors&rdquo;, in this order. Use
        official photos you have permission to use. Without a photo, the card shows the person&apos;s initials.
      </p>

      {list.map((person, i) => (
        <div key={i} className={styles.block}>
          <div className={styles.blockHeader}>
            <strong>{person.name || "New ambassador"}</strong>
            <div className={styles.rowActions}>
              <MoveButtons index={i} length={list.length} label="ambassador" onMove={(from, to) => update((d) => void (d.ambassadors = move(d.ambassadors, from, to)))} />
              <ConfirmButton warning={`Remove ${person.name || "this ambassador"}?`} onConfirm={() => update((d) => void d.ambassadors.splice(i, 1))}>
                Remove
              </ConfirmButton>
            </div>
          </div>
          <div className={styles.grid2}>
            <TextField label="Name" required value={person.name} onChange={(v) => set(i, (a) => void (a.name = v))} />
            <TextField label="Who they are" hint="For example: Actress and TV host" value={person.role} onChange={(v) => set(i, (a) => void (a.role = v))} />
          </div>
          <div className={styles.grid2}>
            <ImageField label="Photo" value={person.image} onChange={(v) => set(i, (a) => void (a.image = v))} />
            <TextArea label="Short description" rows={5} value={person.blurb} onChange={(v) => set(i, (a) => void (a.blurb = v))} />
          </div>
          <TextField
            label="“Read more” link (optional)"
            hint={
              <>
                Leave empty for no link. To link to a post on the Events and News page, use <code>/events/</code>{" "}
                followed by the post&apos;s web address.
              </>
            }
            value={person.link}
            onChange={(v) => set(i, (a) => void (a.link = v.trim()))}
          />
        </div>
      ))}
      <button
        type="button"
        className={styles.addButton}
        onClick={() => update((d) => void d.ambassadors.push({ name: "", role: "", image: "", blurb: "", link: "" }))}
      >
        + Add ambassador
      </button>
    </section>
  );
}

// ---------------------------------------------------------------- brands page

function BrandsPageEditor({ content, update }: { content: SiteContent; update: (fn: Updater) => void }) {
  const page = content.brandsPage;
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <h1>Brands page text</h1>
        <a href="/brands" target="_blank" rel="noreferrer" className={styles.linkButton}>
          View page ↗
        </a>
      </div>
      <TextField label="Page title (in the green banner)" required value={page.title} onChange={(v) => update((d) => void (d.brandsPage.title = v))} />
      <TextField label="Heading" value={page.heading} onChange={(v) => update((d) => void (d.brandsPage.heading = v))} />
      <TextArea label="Introduction" rows={6} value={page.intro} onChange={(v) => update((d) => void (d.brandsPage.intro = v))} />
      <p className={styles.hint}>
        Brands appear on the page in the order of the list on the left. Open a brand to edit it, change its order or
        delete it.
      </p>
    </section>
  );
}

// ---------------------------------------------------------------- brand

function BrandEditor({
  brand,
  index,
  count,
  live,
  featured,
  update,
  onMoved,
  onDeleted,
}: {
  brand: BrandContent;
  featured: SiteContent["featured"];
  index: number;
  count: number;
  live: LiveSlugs;
  update: (fn: Updater) => void;
  onMoved: (to: number) => void;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState<string | null>(null); // "category:product" of the product being edited
  const setBrand = (fn: (b: BrandContent) => void) => update((d) => fn(d.brands[index]));
  const productCount = brand.categories.reduce((n, c) => n + c.products.length, 0);

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <h1>{brand.name || "New brand"}</h1>
        <div className={styles.rowActions}>
          {brand.slug ? (
            <a href={`/brands/${brand.slug}`} target="_blank" rel="noreferrer" className={styles.linkButton}>
              View page ↗
            </a>
          ) : null}
          <MoveButtons
            index={index}
            length={count}
            label="brand"
            onMove={(from, to) => {
              update((d) => void (d.brands = move(d.brands, from, to)));
              onMoved(to);
            }}
          />
          <ConfirmButton
            warning={`Delete ${brand.name || "this brand"} and its ${productCount} products?`}
            onConfirm={() => {
              update((d) => {
                d.brands.splice(index, 1);
                pruneFeatured(d);
              });
              onDeleted();
            }}
          >
            Delete brand
          </ConfirmButton>
        </div>
      </div>

      <div className={styles.grid2}>
        <TextField
          label="Brand name"
          required
          value={brand.name}
          onChange={(v) =>
            setBrand((b) => {
              if (!live.brands.has(b.slug) && (!b.slug || b.slug === slugify(b.name))) b.slug = slugify(v);
              b.name = v;
            })
          }
        />
        <SlugField
          prefix="/brands/"
          value={brand.slug}
          onChange={(v) =>
            update((d) => {
              const old = d.brands[index].slug;
              d.featured.forEach((f) => {
                if (f.brand === old) f.brand = v;
              });
              d.brands[index].slug = v;
            })
          }
        />
      </div>
      <TextField label="Tagline" value={brand.tagline} onChange={(v) => setBrand((b) => void (b.tagline = v))} />
      <TextArea
        label="Description"
        hint="Used for search engines and link previews."
        value={brand.description}
        onChange={(v) => setBrand((b) => void (b.description = v))}
      />
      <div className={styles.grid2}>
        <ImageField label="Logo" required value={brand.logo} onChange={(v) => setBrand((b) => void (b.logo = v))} />
        <ImageField label="Cover banner" required value={brand.cover} onChange={(v) => setBrand((b) => void (b.cover = v))} />
      </div>

      <h2 className={styles.subTitle}>Categories and products</h2>
      {brand.categories.map((category, ci) => (
        <div key={ci} className={styles.category}>
          <div className={styles.categoryHeader}>
            <input
              className={styles.categoryName}
              value={category.name}
              placeholder="Category name"
              aria-label="Category name"
              onChange={(e) => setBrand((b) => void (b.categories[ci].name = e.target.value))}
            />
            <div className={styles.rowActions}>
              <MoveButtons
                index={ci}
                length={brand.categories.length}
                label="category"
                onMove={(from, to) => {
                  setBrand((b) => void (b.categories = move(b.categories, from, to)));
                  setOpen(null);
                }}
              />
              <ConfirmButton
                warning={
                  category.products.length
                    ? `Delete this category and its ${category.products.length} products?`
                    : "Delete this category?"
                }
                onConfirm={() => {
                  update((d) => {
                    d.brands[index].categories.splice(ci, 1);
                    pruneFeatured(d);
                  });
                  setOpen(null);
                }}
              >
                Delete category
              </ConfirmButton>
            </div>
          </div>

          {category.products.length === 0 ? <p className={styles.hint}>No products in this category yet.</p> : null}
          <ul className={styles.productList}>
            {category.products.map((product, pi) => {
              const key = `${ci}:${pi}`;
              const isOpen = open === key;
              return (
                <li key={key} className={isOpen ? styles.productRowOpen : styles.productRow}>
                  <div className={styles.productSummary}>
                    <div className={styles.thumb}>
                      {product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.image} alt="" />
                      ) : null}
                    </div>
                    <button type="button" className={styles.productTitle} onClick={() => setOpen(isOpen ? null : key)}>
                      <strong>{product.name || "New product"}</strong>
                      <small>{product.sizes || "No sizes yet"}</small>
                    </button>
                    <div className={styles.rowActions}>
                      <button type="button" className={styles.secondaryButton} onClick={() => setOpen(isOpen ? null : key)}>
                        {isOpen ? "Close" : "Edit"}
                      </button>
                      <MoveButtons
                        index={pi}
                        length={category.products.length}
                        label="product"
                        onMove={(from, to) => {
                          setBrand((b) => void (b.categories[ci].products = move(b.categories[ci].products, from, to)));
                          if (open === `${ci}:${from}`) setOpen(`${ci}:${to}`);
                          else if (open === `${ci}:${to}`) setOpen(`${ci}:${from}`);
                        }}
                      />
                      {brand.categories.length > 1 ? (
                        <select
                          className={styles.moveSelect}
                          value=""
                          aria-label="Move to another category"
                          onChange={(e) => {
                            const target = Number(e.target.value);
                            setBrand((b) => {
                              const [item] = b.categories[ci].products.splice(pi, 1);
                              b.categories[target].products.push(item);
                            });
                            setOpen(null);
                          }}
                        >
                          <option value="">Move to…</option>
                          {brand.categories.map((c, ti) =>
                            ti === ci ? null : (
                              <option key={ti} value={ti}>
                                {c.name || `Category ${ti + 1}`}
                              </option>
                            ),
                          )}
                        </select>
                      ) : null}
                      <ConfirmButton
                        warning="Delete this product?"
                        onConfirm={() => {
                          update((d) => {
                            d.brands[index].categories[ci].products.splice(pi, 1);
                            pruneFeatured(d);
                          });
                          setOpen(null);
                        }}
                      >
                        Delete
                      </ConfirmButton>
                    </div>
                  </div>
                  {isOpen ? (
                    <ProductEditor
                      brandSlug={brand.slug}
                      isLive={live.products.has(`${brand.slug}/${product.slug}`)}
                      product={product}
                      featured={featured.some((f) => f.brand === brand.slug && f.product === product.slug)}
                      onToggleFeatured={(on) =>
                        update((d) => {
                          d.featured = d.featured.filter((f) => !(f.brand === brand.slug && f.product === product.slug));
                          if (on) d.featured.push({ brand: brand.slug, product: product.slug });
                        })
                      }
                      onChange={(fn) =>
                        update((d) => {
                          const p = d.brands[index].categories[ci].products[pi];
                          const oldSlug = p.slug;
                          fn(p);
                          if (p.slug !== oldSlug)
                            d.featured.forEach((f) => {
                              if (f.brand === brand.slug && f.product === oldSlug) f.product = p.slug;
                            });
                        })
                      }
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            className={styles.addButton}
            onClick={() => {
              setBrand((b) =>
                void b.categories[ci].products.push({ slug: "", name: "", image: "", images: [], imageAlt: "", description: "", sizes: "" }),
              );
              setOpen(`${ci}:${category.products.length}`);
            }}
          >
            + Add product to {category.name || "this category"}
          </button>
        </div>
      ))}
      <button
        type="button"
        className={styles.addButton}
        onClick={() => setBrand((b) => void b.categories.push({ name: "New category", products: [] }))}
      >
        + Add category
      </button>
    </section>
  );
}

function ProductEditor({
  brandSlug,
  isLive,
  product,
  featured,
  onToggleFeatured,
  onChange,
}: {
  brandSlug: string;
  isLive: boolean;
  featured: boolean;
  onToggleFeatured: (on: boolean) => void;
  product: ProductContent;
  onChange: (fn: (p: ProductContent) => void) => void;
}) {
  const gallery = product.images ?? [];
  return (
    <div className={styles.productEditor}>
      <div className={styles.grid2}>
        <TextField
          label="Product name"
          required
          value={product.name}
          onChange={(v) =>
            onChange((p) => {
              if (!isLive && (!p.slug || p.slug === slugify(p.name))) p.slug = slugify(v);
              if (!p.imageAlt || p.imageAlt === p.name) p.imageAlt = v;
              p.name = v;
            })
          }
        />
        <SlugField prefix={`/brands/${brandSlug || "…"}/`} value={product.slug} onChange={(v) => onChange((p) => void (p.slug = v))} />
      </div>
      <label className={styles.checkbox}>
        <input type="checkbox" checked={featured} disabled={!product.slug} onChange={(e) => onToggleFeatured(e.target.checked)} />
        <span>
          <strong>Show in Featured Products</strong> on the homepage
        </span>
      </label>
      <TextField label="Available sizes" hint="For example: 6g, 50g, 180g & 400g" value={product.sizes} onChange={(v) => onChange((p) => void (p.sizes = v))} />
      <TextArea label="Description" rows={5} value={product.description ?? ""} onChange={(v) => onChange((p) => void (p.description = v))} />
      <div className={styles.grid2}>
        <ImageField label="Card image (shown in the product list)" required value={product.image} onChange={(v) => onChange((p) => void (p.image = v))} />
        <TextField
          label="Image description"
          hint="Describes the picture for people who can't see it, and for Google."
          value={product.imageAlt}
          onChange={(v) => onChange((p) => void (p.imageAlt = v))}
        />
      </div>

      <div className={styles.field}>
        <span>Product page pictures</span>
        <small>Shown on the product&apos;s own page. If you add none, the card image is used.</small>
      </div>
      <div className={styles.galleryGrid}>
        {gallery.map((image, gi) => (
          <div key={gi} className={styles.galleryItem}>
            <ImageField
              compact
              label={`Picture ${gi + 1}`}
              value={image}
              onChange={(v) => onChange((p) => void (p.images![gi] = v))}
            />
            <div className={styles.rowActions}>
              <MoveButtons index={gi} length={gallery.length} label="picture" onMove={(from, to) => onChange((p) => void (p.images = move(p.images!, from, to)))} />
              <button type="button" className={styles.dangerButton} onClick={() => onChange((p) => void p.images!.splice(gi, 1))}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className={styles.addButton}
        onClick={() =>
          onChange((p) => {
            p.images = [...(p.images ?? [])];
            // Start the gallery with the card image so it is not lost from the product page.
            if (p.images.length === 0 && p.image) p.images.push(p.image);
            p.images.push("");
          })
        }
      >
        + Add picture
      </button>
    </div>
  );
}

// ---------------------------------------------------------------- events and news

function EventsPageEditor({ content, update }: { content: SiteContent; update: (fn: Updater) => void }) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <h1>Events and news page</h1>
        <a href="/events" target="_blank" rel="noreferrer" className={styles.linkButton}>
          View page ↗
        </a>
      </div>
      <TextField label="Page title (in the green banner)" required value={content.eventsPage.title} onChange={(v) => update((d) => void (d.eventsPage.title = v))} />
      <TextArea
        label="Introduction (optional)"
        value={content.eventsPage.intro}
        onChange={(v) => update((d) => void (d.eventsPage.intro = v))}
      />
      <p className={styles.hint}>
        Posts appear on the page in the order of the list on the left; new posts are added at the top. Posts marked
        &ldquo;Hidden&rdquo; are not shown on the website.
      </p>
    </section>
  );
}

const BLOCK_LABELS: Record<PostBlock["type"], string> = {
  text: "Paragraph",
  quote: "Paragraph with a quote box",
  highlight: "Paragraph with highlighted words",
};

function PostEditor({
  post,
  index,
  count,
  live,
  update,
  onMoved,
  onDeleted,
}: {
  post: PostContent;
  index: number;
  count: number;
  live: LiveSlugs;
  update: (fn: Updater) => void;
  onMoved: (to: number) => void;
  onDeleted: () => void;
}) {
  const setPost = (fn: (p: PostContent) => void) => update((d) => fn(d.posts[index]));
  const labels = useMemo(() => ["News", "Event", "Press Release", "Announcement"], []);

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <h1>{post.title || "New event or news"}</h1>
        <div className={styles.rowActions}>
          {post.slug && post.published ? (
            <a href={`/events/${post.slug}`} target="_blank" rel="noreferrer" className={styles.linkButton}>
              View page ↗
            </a>
          ) : null}
          <MoveButtons
            index={index}
            length={count}
            label="post"
            onMove={(from, to) => {
              update((d) => void (d.posts = move(d.posts, from, to)));
              onMoved(to);
            }}
          />
          <ConfirmButton
            warning="Delete this post?"
            onConfirm={() => {
              update((d) => void d.posts.splice(index, 1));
              onDeleted();
            }}
          >
            Delete post
          </ConfirmButton>
        </div>
      </div>

      <label className={styles.checkbox}>
        <input type="checkbox" checked={post.published} onChange={(e) => setPost((p) => void (p.published = e.target.checked))} />
        <span>
          <strong>Show on website</strong> — untick to keep it as a hidden draft
        </span>
      </label>

      <TextField
        label="Title"
        required
        value={post.title}
        onChange={(v) =>
          setPost((p) => {
            if (!live.posts.has(p.slug) && (!p.slug || p.slug === slugify(p.title))) p.slug = slugify(v);
            if (!p.imageAlt || p.imageAlt === p.title) p.imageAlt = v;
            p.title = v;
          })
        }
      />
      <SlugField prefix="/events/" value={post.slug} onChange={(v) => setPost((p) => void (p.slug = v))} />
      <div className={styles.grid2}>
        <TextField label="Label" hint="Small text above the title, e.g. News, Event, Press Release" list="post-labels" value={post.label} onChange={(v) => setPost((p) => void (p.label = v))} />
        <TextField label="Date (optional)" type="date" value={post.date} onChange={(v) => setPost((p) => void (p.date = v))} />
      </div>
      <datalist id="post-labels">
        {labels.map((l) => (
          <option key={l} value={l} />
        ))}
      </datalist>
      <TextArea label="Short summary (shown on the listing card)" rows={3} value={post.summary} onChange={(v) => setPost((p) => void (p.summary = v))} />
      <div className={styles.grid2}>
        <ImageField label="Main picture" required value={post.image} onChange={(v) => setPost((p) => void (p.image = v))} />
        <TextField
          label="Picture description"
          hint="Describes the picture for people who can't see it, and for Google."
          value={post.imageAlt}
          onChange={(v) => setPost((p) => void (p.imageAlt = v))}
        />
      </div>

      <h2 className={styles.subTitle}>Article</h2>
      {post.blocks.map((block, bi) => (
        <div key={bi} className={styles.block}>
          <div className={styles.blockHeader}>
            <select
              value={block.type}
              aria-label="Paragraph style"
              onChange={(e) =>
                setPost((p) => {
                  const type = e.target.value as PostBlock["type"];
                  const old = p.blocks[bi];
                  const text = old.type === "text" ? old.text : old.before;
                  const special = old.type === "quote" ? old.quote : old.type === "highlight" ? old.highlight : "";
                  const after = old.type === "text" ? "" : old.after ?? "";
                  p.blocks[bi] =
                    type === "text"
                      ? { type, text: [text, special, after].filter(Boolean).join(" ") }
                      : type === "quote"
                        ? { type, before: text, quote: special, after }
                        : { type, before: text, highlight: special, after };
                })
              }
            >
              {(Object.keys(BLOCK_LABELS) as PostBlock["type"][]).map((t) => (
                <option key={t} value={t}>
                  {BLOCK_LABELS[t]}
                </option>
              ))}
            </select>
            <div className={styles.rowActions}>
              <MoveButtons index={bi} length={post.blocks.length} label="paragraph" onMove={(from, to) => setPost((p) => void (p.blocks = move(p.blocks, from, to)))} />
              <ConfirmButton warning="Delete this paragraph?" onConfirm={() => setPost((p) => void p.blocks.splice(bi, 1))}>
                Delete
              </ConfirmButton>
            </div>
          </div>
          {block.type === "text" ? (
            <TextArea label="Text" rows={5} value={block.text} onChange={(v) => setPost((p) => void ((p.blocks[bi] as { text: string }).text = v))} />
          ) : (
            <>
              <TextArea label="Text before" rows={3} value={block.before} onChange={(v) => setPost((p) => void ((p.blocks[bi] as { before: string }).before = v))} />
              {block.type === "quote" ? (
                <TextArea label="Quote (shown in a white box)" rows={4} value={block.quote} onChange={(v) => setPost((p) => void ((p.blocks[bi] as { quote: string }).quote = v))} />
              ) : (
                <TextField
                  label="Highlighted words (shown in green)"
                  value={block.highlight}
                  onChange={(v) => setPost((p) => void ((p.blocks[bi] as { highlight: string }).highlight = v))}
                />
              )}
              <TextArea label="Text after (optional)" rows={2} value={block.after ?? ""} onChange={(v) => setPost((p) => void ((p.blocks[bi] as { after?: string }).after = v))} />
            </>
          )}
        </div>
      ))}
      <button type="button" className={styles.addButton} onClick={() => setPost((p) => void p.blocks.push({ type: "text", text: "" }))}>
        + Add paragraph
      </button>
    </section>
  );
}
