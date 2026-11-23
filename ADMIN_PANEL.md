# Admin panel

The website has an admin panel at **`/admin`** (for example `https://procusghana.com/admin`).
Admins can:

- read every **form submission** sent through the website (partner enquiries and job applications,
  with the attached resume), mark them read or unread, delete them, and download them as a spreadsheet;
- add, edit, reorder and remove the **brand ambassadors** shown on the homepage and the brands page;
- choose and order the **Featured Products** tabs on the homepage (or tick "Show in Featured Products"
  on any product);
- add, edit, reorder and delete everything on:

- the **Our Brands** page: page text, brands, logos, cover banners, categories and all products
  (name, web address, sizes, description, card image and product-page pictures);
- the **Events and News** page: page text, and events, news and press releases
  (title, label, date, picture, summary, article paragraphs, show or hide).

Changes go live as soon as the admin clicks **Save changes**. Nothing needs rebuilding or redeploying.

## Logging in

The admin password is built into the code (`lib/adminAuth.ts`) as a scrambled fingerprint, so the
plain password is never stored in the repository and **no server setting is needed**. Ask the site
owner for the password. It works the same with `npm run dev` on your own computer
(`http://localhost:3000/admin`) and on the live site.

### Forgot password

On the login screen choose **Forgot password?** and enter a recovery email address. If it is on the
recovery list, the site emails it a link to choose a new password. The link works once and expires
after 1 hour. The answer on screen is the same for any address, so the form can't be used to find out
which addresses are on the list. At most 3 reset emails per address (and 20 in total) are sent per hour.

The recovery list starts with **hammond@procusghana.com**. Admins can add or remove addresses under
**Account → Password & recovery** in the admin panel (at least one must stay). Everyone on the list is
emailed whenever the password changes. Reset emails and alerts use the same mailbox settings (SMTP) as
the website forms, so they only work once those are set on the server.

### Changing the password

- From the admin panel: **Account → Password & recovery → Change password**. Other browsers are logged out.
- By hand: run `node scripts/hash-admin-password.mjs "your new password"` and paste the line it prints into
  `ADMIN_PASSWORD_HASH` in `lib/adminAuth.ts`. This only takes effect if the password has never been
  changed from the admin panel or a reset link (a password changed there is kept in the storage folder,
  `admin-account.json`, and takes priority).

Which password is used, first match wins: one changed from the admin panel or a reset link, then
`ADMIN_PASSWORD` if set on the server, then the built-in one.

Reset links point to `https://procusghana.com`. If the site moves to another address, set
`SITE_URL=https://new-address` on the server.

## Hosting requirements

The site must run as a normal Node.js server (`npm install`, `npm run build`, then `npm start`).
A static export, or hosts that don't keep files between visits (such as Netlify or Vercel), will not work,
because the admin panel saves files on the server.

1. Edits, uploaded images and form submissions are saved in the `storage` folder inside the project
   (already in `.gitignore`, so `git pull` never touches it). **Do not delete this folder when updating
   the site**, e.g. by deleting and re-cloning the project. Optionally set `CONTENT_DIR=/some/folder`
   to keep it outside the project instead.

2. The Node.js process must be able to write to that folder.

3. Back up the `storage` folder (or `CONTENT_DIR`) with the rest of the server. It contains:
   - `content.json`: the current brands, products and posts;
   - `backups/`: the last 30 saved versions (copy one over `content.json` to roll back);
   - `uploads/`: images uploaded from the admin panel (served at `/uploads/<file>`).
   - `submissions/`: every form sent from the website, one file each, plus attached resumes in
     `submissions/files/`. These contain personal data: keep the folder private and backed up.
   - `admin-account.json`: the recovery email list and, if changed, the admin password fingerprint.

Until the first save, the site shows the original content from `lib/siteData.ts`.
After the first save, `content.json` is what the brand and events pages show.
The homepage ambassadors also come from `content.json`; the rest of the homepage and the About,
Careers and Media pages still use `lib/siteData.ts`.

## Changes to existing pages

- "Events" is renamed **"Events and news"** in the menu and **"Events and News"** on the page.
  `/events` now lists all posts; each post has its own page at `/events/<web-address>`.
  The Kudus press release is at `/events/kivo-signs-mohammed-kudus-as-brand-ambassador`,
  and the homepage "Read More" link points there.
- Products appear in the order set in the admin panel. They start in the same order as before
  (smallest pack size first).
- The homepage "Our Brand Ambassadors" section now shows a card for each ambassador: Mohammed Kudus,
  Nana Ama McBrown, Chef Abbys and Dr Likee. The same cards fill the previously empty
  "Ambassadors" heading on the brands page, with photos in `public/assets/ambassadors/`.
- The homepage "Featured Products" tabs now come from the admin panel instead of `lib/siteData.ts`.
- The Kivo 4 in 1 Tutti Frutti Gari Soaking Mix has been removed from the products.
- `/`, `/brands`, `/brands/...` and `/events/...` are now rendered on each request, so edits show immediately.

## Form submissions

Every form (Partner with us / Contact, and Careers) is saved on the server first, then emailed to
info@procusghana.com from the company's own mailbox (SMTP settings, see README.md "Connecting the
contact / resume forms"). If the email fails, or the mailbox is not set up, the visitor still sees
"sent" and the message waits in the admin panel, marked "Email notification: Not sent".
Resumes can only be opened by a logged-in admin.

## Security notes

- Serve the site over HTTPS. A long, unusual password is much harder to guess than a short common one.
- Failed logins wait 1.5 seconds before answering. 10 wrong passwords within 15 minutes lock that
  visitor out for the rest of the 15 minutes, and 30 wrong passwords from anyone pause all logins for
  15 minutes (admins who are already logged in can keep working).
- The key that signs login cookies is generated on first use and kept in the storage folder
  (`.admin-session-secret`); it is never in the code.
- Logins last 7 days. "Log out" in the admin panel ends the session on that browser.
- Only image files (PNG, JPG, WEBP, GIF, AVIF, SVG) up to 15 MB can be uploaded.
- If two admins edit at the same time, the second save is refused with a message,
  instead of silently overwriting the first person's changes.
