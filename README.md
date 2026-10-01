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

The contact and careers forms send through a server-side Next.js route backed by Brevo Transactional Email. Submissions go to `Skthakur10@gmail.com`, with `losharhammond@gmail.com` copied; replies go to the submitter. The sender is configured through `BREVO_SENDER_EMAIL` and should be `hammond@procusghana.com` once that address is verified in Brevo. Career applications may include a PDF résumé up to 500KB. The route validates submissions and attachments, escapes form content, checks the same-origin request, and keeps the Brevo API key on the server.

Before running locally or deploying, create a Brevo account, verify the sending address in Brevo, and set these environment variables. Copy `.env.example` to `.env.local` for local development; in production, set them in the hosting provider's environment-variable settings and redeploy. Do not commit `.env.local` or the API key.

```env
BREVO_API_KEY=your_private_brevo_api_key
BREVO_SENDER_EMAIL=your_verified_sender_address
BREVO_SENDER_NAME=Procus Ghana Website
```

After configuration, test both the contact form and a careers submission (including a PDF) and confirm the messages arrive at the configured recipients. Form submissions will return a clear setup error until the server environment variables are present.

## Deployment

This is a standard Next.js app and deploys anywhere Next.js runs:

- **Vercel** — connect the repo, no config needed.
- **Netlify** — use the official Next.js Runtime plugin.
- **Node/VPS/cPanel (Node hosting)** — `npm run build`, then `npm start` behind a reverse proxy (or use `next start -p <port>`).

The forms require the Brevo server environment variables above. Deploy to a Next.js-compatible Node/serverless host so the `/api/forms` route can run; a static-only export cannot send form email through this server route.

## Design system notes

- Colours, fonts, spacing and the container width were extracted from the live site's shipped CSS: primary brand gradient `#008c46 → #98cb4f`, heading font **PT Serif**, body font **Poppins**, warm cream/grey section backgrounds (`#f7f3f0`, `#ede9e9`).
- Tailwind CSS is installed and provides the base reset/utility layer; most component visuals are implemented as CSS Modules (one per component/page) copied closely from the site's original compiled styles, for pixel accuracy.
