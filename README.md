# Procus Ghana Website

A rebuild of the [procusghana.com](https://procusghana.com/) marketing site — Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 + CSS Modules.

This project was reconstructed from the live public website because the original source code was lost. It aims to match the live site's structure, content, styling, and behaviour as closely as possible. See [REBUILD_NOTES.md](./REBUILD_NOTES.md) for exactly what was recreated, what's missing, and what to verify.

## Project overview

- **Home** (`/`) — hero, "What we do", brand strip, featured products tabs, brand ambassador, packaging, testimonials, partner form.
- **Our Company** (`/about`) — company story, purpose, values, culture.
- **Our Brands** (`/brands`) — Kivo and Mutlu brand cover cards.
  - `/brands/[brand]` — product grid grouped by category (e.g. Kivo "Culinary" / "Dairy", Mutlu "Pasta").
  - `/brands/[brand]/[product]` — individual product detail page (16 products, generated from data).
- **Careers** (`/careers`) — culture copy + resume/application form (`#resume-form`).
- **Contact** (`/contact`) — partner enquiry form.
- **Events** (`/events`) — press release post.
- **Media** (`/media`, `/media/[slug]`) — advert listing + detail.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build & run in production

```bash
npm run build
npm start
```

### Type-check & lint

```bash
npx tsc --noEmit
npm run lint
```

## Project structure

```
app/                       Route segments (App Router)
  page.tsx                 Home
  about/page.tsx
  brands/page.tsx           Brand index
  brands/[brand]/page.tsx        Product grid per brand
  brands/[brand]/[product]/page.tsx  Product detail
  careers/page.tsx
  contact/page.tsx
  events/page.tsx
  media/page.tsx
  media/[slug]/page.tsx
  layout.tsx, globals.css  Root layout, fonts, design tokens
components/                Reusable UI: Navbar, Footer, Heading, Button,
                            PageHeader, ProductCard, FeaturedProducts,
                            Testimonials, AmbassadorCard, ContactForm
lib/siteData.ts            All copy, nav links, brand/product catalogue,
                            testimonials — the single source of content
public/assets/              Images, icons, logo (organised by section)
```

## Editing content

Almost everything text- or data-driven lives in **[lib/siteData.ts](./lib/siteData.ts)**:

- `navLinks`, `footerColumns`, `socialLinks`, `siteInfo` — nav, footer, contact details.
- `brands` — the Kivo and Mutlu catalogue. Each product has `slug`, `name`, `image`, `description`, `sizes`. Adding a product here automatically creates its detail page at build time (via `generateStaticParams`) — no new files needed.
- `testimonials`, `ambassador`, `eventPost`, `adverts` — the rest of the on-page copy.

Page-specific copy (headings, paragraphs that aren't reused) lives directly in each `app/**/page.tsx`.

### Adding a new product

Add an entry to the relevant brand's `categories[].products[]` array in `lib/siteData.ts` with an image in `public/assets/products/<brand>/`. The grid and its detail page are generated automatically.

### Replacing images

Drop the new file into the matching folder under `public/assets/` (see structure there) and update the path in `lib/siteData.ts` or the relevant `page.tsx`. All images render through `next/image`, so they're resized/optimised automatically — no need to pre-resize.

### Connecting the contact / resume forms

Both forms (`components/ContactForm.tsx`) are **frontend-only right now** — they validate, then show a success message, but don't send data anywhere. To wire them up:

1. Add a server action or API route (e.g. `app/api/contact/route.ts`) that sends the form data wherever you want (email via Resend/SendGrid, a CRM webhook, etc).
2. In `handleSubmit` inside `ContactForm.tsx`, replace the `// Frontend-only for now` block with a `fetch()`/server-action call to that endpoint.
3. Keep any API keys in environment variables (`.env.local`, gitignored) — never commit secrets.

## Deployment

This is a standard Next.js app and deploys anywhere Next.js runs:

- **Vercel** — connect the repo, no config needed.
- **Netlify** — use the official Next.js Runtime plugin.
- **Node/VPS/cPanel (Node hosting)** — `npm run build`, then `npm start` behind a reverse proxy (or use `next start -p <port>`).

There are no environment variables required for the current (frontend-only) build. If you wire up the contact form to a real backend, add its secrets as environment variables on your hosting platform and reference them via `process.env`.

## Design system notes

- Colours, fonts, spacing and the container width were extracted from the live site's shipped CSS: primary brand gradient `#008c46 → #98cb4f`, heading font **PT Serif**, body font **Poppins**, warm cream/grey section backgrounds (`#f7f3f0`, `#ede9e9`).
- Tailwind CSS is installed and provides the base reset/utility layer; most component visuals are implemented as CSS Modules (one per component/page) copied closely from the site's original compiled styles, for pixel accuracy.
