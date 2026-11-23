# Procus Ghana Website

A rebuild of the [procusghana.com](https://procusghana.com/) marketing site — Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 + CSS Modules.

This project was reconstructed from the live public website because the source code was lost. It aims to match the live site's structure, content, styling, and behaviour as closely as possible. See [REBUILD_NOTES.md](./REBUILD_NOTES.md) for exactly what was recreated, what's missing, and what to verify.

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

### Connecting the contact/resume forms

The contact and careers forms send through a server-side Next.js route (`app/api/forms/route.ts`). Each submission is first saved to the admin panel (`/admin`, Form submissions), then emailed from the company's own mailbox over SMTP, the same way an email app like Outlook sends mail. No third-party email or form service is used.

Emails go to `info@procusghana.com` only, and Reply goes straight to the visitor. Career applications include the PDF résumé (up to 500KB) as an attachment. The route validates submissions and attachments, escapes form content, checks the same-origin request, and keeps the mailbox password on the server. If sending fails, the visitor still sees "sent" and the message waits in the admin panel marked "Not sent".

Set these environment variables on the server (copy `.env.example` to `.env.local` for local development; never commit it):

```
SMTP_HOST=mail server of your email provider (see below)
SMTP_PORT=465
SMTP_USER=website@procusghana.com
SMTP_PASS=that mailbox's password or app password
```

Optional: `MAIL_TO` (who receives the forms, comma-separated), `MAIL_CC` (copies), `MAIL_FROM_NAME` (sender name, default "Procus Ghana Website"), `SMTP_SECURE` (only for unusual ports), and `SMTP_DEBUG=1` to log the conversation with the mail server when troubleshooting.

Settings for common providers (use whichever hosts the procusghana.com mailboxes):

| Provider | SMTP_HOST | SMTP_PORT | Password |
| --- | --- | --- | --- |
| Zoho Mail (company domain) | `smtppro.zoho.com` (or `smtppro.zoho.eu` / `.in` for those regions) | 465 | Mailbox password, or an app-specific password if two-factor sign-in is on |
| Google Workspace | `smtp.gmail.com` | 465 | An App Password (needs 2-Step Verification on the mailbox) |
| Microsoft 365 | `smtp.office365.com` | 587 | Mailbox password, with SMTP AUTH enabled for that mailbox. Microsoft is turning password sign-in for SMTP off by default at the end of December 2026, so check with your Microsoft 365 admin first |
| cPanel / web host email | usually `mail.procusghana.com` | 465 | Mailbox password |

Use a dedicated mailbox such as `website@procusghana.com` rather than a person's own mailbox, so the password is never a staff member's.

After configuration, test both the contact form and a careers submission (including a PDF) and confirm the messages arrive at the configured recipients. Until the email settings are present, submissions are still accepted and saved in the admin panel, but no email is sent.

## Deployment

This is a standard Next.js app and deploys anywhere Next.js runs:

- **Vercel** — connect the repo, no config needed.
- **Netlify** — use the official Next.js Runtime plugin.
- **Node/VPS/cPanel (Node hosting)** — `npm run build`, then `npm start` behind a reverse proxy (or use `next start -p <port>`).

The forms require the SMTP environment variables above. Deploy as a normal Node.js server (`npm run build`, then `npm start`) so the `/api/forms` route and the admin panel can run; a static-only export cannot send form email or save submissions.

## Design system notes

- Colours, fonts, spacing and the container width were extracted from the live site's shipped CSS: primary brand gradient `#008c46 → #98cb4f`, heading font **PT Serif**, body font **Poppins**, warm cream/grey section backgrounds (`#f7f3f0`, `#ede9e9`).
- Tailwind CSS is installed and provides the base reset/utility layer; most component visuals are implemented as CSS Modules (one per component/page) copied closely from the site's original compiled styles, for pixel accuracy.
