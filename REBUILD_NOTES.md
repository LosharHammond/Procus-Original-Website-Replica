# Rebuild Notes

How this site was reconstructed from [procusghana.com](https://procusghana.com/) after the original source was lost, and what to check before you rely on it as the new source of truth.

## Method

1. Read the six saved HTML pages you provided (Home, Events/press release, Our Company, Our Brands, Careers, Contact), extracting real copy and the compiled CSS shipped with the site (colours, fonts, spacing, component layout rules).
2. Where the saved pages didn't cover a route linked from the nav/footer (brand listings, all 16 individual product pages, the Media section, missing hero images, the logo mark, the catalogue PDF), fetched those directly from the **live public site** (`procusghana.com`) — same domain you asked to be rebuilt — to get accurate copy and real image assets rather than inventing placeholders.
3. Rebuilt the design system (green gradient `#008c46 → #98cb4f`, PT Serif headings, Poppins body, cream/grey section backgrounds, card and button styles) as CSS Modules matched closely to the site's original compiled CSS.
4. Data-driven the brand/product catalogue (`lib/siteData.ts`) so all 16 product pages are generated from one array instead of being hand-duplicated.

## Verification pass (exact-fidelity audit)

After a few reported issues, I did a full audit: re-fetched every page directly from the live site and diffed the *actual DOM structure and CSS*, not just the visible text, against the build. This caught real drift that a visual glance would miss — things like the product image being 420×420/contain instead of the real 500×500/cover, the "Our Values" section being a card grid I'd invented instead of the live site's plain bullet list, the Careers form incorrectly showing a phone/email sidebar that doesn't exist on the live version, and the Media page missing its testimonials and contact-form sections entirely. Full list of what changed is in the git log. Every page's structure, spacing, and form behavior now matches what's live, verified via computed styles (grid columns, positioning, image dimensions) rather than eyeballing it.

## Pages rebuilt

| Route | Status |
|---|---|
| `/` Home | Full rebuild — hero, "what we do", brand strip, featured product tabs, testimonials, ambassador, packaging, partner form |
| `/about` Our Company | Full rebuild — company story, purpose, values, culture |
| `/brands` Our Brands (index) | Full rebuild — Kivo/Mutlu cover cards |
| `/brands/kivo`, `/brands/mutlu` | Full rebuild — product grids grouped by category |
| `/brands/[brand]/[product]` × 16 | Full rebuild, generated from data — 11 Kivo products, 5 Mutlu products |
| `/careers` | Full rebuild — culture copy + application form |
| `/contact` | Full rebuild — partner enquiry form |
| `/events` | Full rebuild — the Mohammed Kudus brand-ambassador press release |
| `/media`, `/media/[slug]` | Full rebuild — the live site's real YouTube video IDs for both commercials are embedded directly |

## Assets

All real assets were recovered — either from your saved HTML's companion `_files` folders or fetched from the live site — and organised under `public/assets/`:

- `logo/` — the Procus "P" mark, extracted as the original inline SVG (exact vector, not a re-drawing).
- `hero/` — page banner backgrounds (about, careers) plus `kivo-advert.mp4` (3.3MB), the real video now used as hero slide 1. The about-page banner image is reused as-is for Brands/Events/Media headers because the live site's own CSS does the same (all four reference the same source image).
- `products/kivo/`, `products/mutlu/` — all 16 real product photos.
- `brands/` — Kivo/Mutlu logos and cover images.
- `about/`, `careers/`, `events/`, `ambassadors/` — section photography (company, purpose, culture, join-the-team, Kudus signing, Kudus portrait).
- `icons/` — social icons, phone/mail icons, FDA approval badge.
- `adverts/` — the two commercial thumbnails from the Media page.
- `eCATALOGUE-2026.pdf` (in `public/`, 22MB) — the real downloadable product catalogue.

**Nothing here is a placeholder or stock image** — every image is the real Procus/Kivo/Mutlu asset.

### One thing to know: `kivo/rosemary.jpg` is 6.8MB

The source file straight from the live site is unusually large. `next/image` resizes it on the fly for every page that uses it, so it won't slow down the site, but you may want to re-export a smaller version (under ~500KB) next time you update product photography.

## Homepage: video hero + layout fix (latest update)

Two changes went into this pass, both on `/` only — every other page was already confirmed correct:

1. **Hero is now a 3-slide video carousel** (`components/HeroSlider.tsx`), replacing the single static-image hero. While rechecking the homepage I found the *live* site had itself been updated since your saved HTML was captured — it now runs a single autoplaying background video (`/videos/kivo_advert_upd.mp4`) instead of a static image. I pulled that real video down and used it as slide 1 (same heading/subheading/CTA as the live site). Slides 2 and 3 are new — built from the two real Kivo commercials (Hot Pepper, Baked Beans) that also turned out to be live on the site's Media pages, using their real YouTube video IDs as looping muted backgrounds. Auto-advances every 7s, pauses on hover/focus, has prev/next arrows and dot navigation, and respects `prefers-reduced-motion`. The heading/subheading copy on slides 2–3 is new copy I wrote for this feature (not scraped) since no 3-slide hero existed anywhere to copy from — happy to adjust the wording.
2. **Fixed a real layout bug** in the "What we do" and "Our packaging" sections: the CSS was targeting the wrong element (`.alook > div` was matching the outer `.container` wrapper instead of the inner two-column row, because of an extra nesting level introduced by the full-bleed background pattern), which collapsed those two sections to a single stacked column at desktop widths instead of the intended side-by-side layout. Fixed by giving the row its own class (`.alookRow` / `.packagingRow`) instead of relying on a fragile child-combinator selector. Verified at 375px, 640px, and 1440px widths — correctly stacks on mobile and sits side-by-side from ~1200px up.

As a side effect of pulling the real commercial video IDs, the two Media pages (`/media/kivo-hot-pepper-commercial`, `/media/kivo-baked-beans-commercial`) now embed the real YouTube videos too — this resolves the "video embeds are placeholders" item from the first rebuild pass.

## Homepage hero: swapped in your real TVCs

You provided two real commercials (`Kivo More Kivo Inside Single Pack TVC 45'.mov`, `Strawberry Gari Mix TVC 30'.mov`) to replace the hero video mix from the previous pass. The hero is now a 2-slide carousel using these instead:

- Both were re-encoded from the source `.mov` (1080p H.264, 73MB and 40MB) down to 720p, audio stripped (the hero video is always muted anyway), landing at 7.6MB and 3.2MB — small enough to autoplay smoothly as a background loop. Originals are untouched in your Downloads folder.
- **"Strawberry Gari Mix" isn't in the product catalogue yet** — I don't have a real product photo, description, or size list for it, so that slide's "Explore" button links to the general `/brands/kivo` page rather than a made-up product detail page. Send me the product details (or the live product page once it exists) and I'll add it properly to `lib/siteData.ts` with its own page.
- Slide headline/subheading copy is mine, written to match each video's theme — say the word if you want different wording.

## What's uncertain / needs your input

- **Contact/resume forms are frontend-only**, exactly as instructed: they validate and show a success message but don't send anywhere yet. See the "Connecting the contact / resume forms" section in [README.md](./README.md) for how to wire them to email/CRM once you tell me where submissions should go.
- **Homepage hero button behaviour**: on the live site the top-nav "Contact" control renders as a `<button>` rather than a link, which usually means it does client-side navigation. I've made it a normal link to `/contact`, which produces the same visible result.
- **Hero slides 2 and 3 headline copy** is new (see above) — say the word if you'd rather it match specific campaign copy.
- I did **not** find a sitemap.xml or robots.txt on the live site, so none was carried over. Happy to add one on request.

## Design decisions worth knowing about

- **Tech stack**: Next.js 16 (App Router) + TypeScript + Tailwind CSS 4, exactly as requested. Tailwind provides the base reset; most component styling is hand-written CSS Modules copied closely from the site's compiled CSS, which was the more reliable path to pixel accuracy than trying to reverse-engineer everything into utility classes.
- **Product pages are generated, not hand-built**: adding/removing a product is a one-line change in `lib/siteData.ts` rather than creating a new file — this trades a little bit of "literal 1:1 file structure" for much easier long-term editing, which seemed like the right call for a site you'll be maintaining yourself.
- I fixed the one obvious typo I found in a product description ("cooking you rother meals" → "cooking your other meals") in the Rosemary product copy — no other wording was changed.

## How to run it

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # production build (verified working — 30 pages generate successfully)
npm start
```

## What to verify manually

- Compare each page side-by-side with procusghana.com on desktop, tablet, and phone widths — I've checked structure and content programmatically (accessibility tree + extracted text, all pages type-check, lint clean, and build to static HTML with no errors) but you know the brand's look best.
- Confirm the two advert video links above.
- Confirm the phone/email/social links in `lib/siteData.ts` are still current.
- Decide where contact-form submissions should go, then see the README for wiring instructions.

No changes beyond this rebuild were made — per your instructions, I stopped here rather than redesigning anything. Let me know what you'd like adjusted next.
