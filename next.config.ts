import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // Loaded with Node's own require only when an email is sent, so a missing install
  // can't break the pages and admin screens that import the mailer.
  serverExternalPackages: ["nodemailer"],
};

export default nextConfig;
