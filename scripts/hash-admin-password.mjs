// Prints the fingerprint for a new admin password, to paste into ADMIN_PASSWORD_HASH in lib/adminAuth.ts.
// Usage (Windows, Mac or Linux):  node scripts/hash-admin-password.mjs "your new password"
import crypto from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 8) {
  console.error('Give a password of at least 8 characters, e.g. node scripts/hash-admin-password.mjs "my new password"');
  process.exit(1);
}
const salt = crypto.randomBytes(16);
const hash = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
console.log(`scrypt$16384$${salt.toString("base64")}$${hash.toString("base64")}`);
