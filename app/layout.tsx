import type { Metadata } from "next";
import { Poppins, PT_Serif } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { siteInfo } from "@/lib/siteData";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const ptSerif = PT_Serif({
  variable: "--font-pt-serif",
  subsets: ["latin"],
  weight: ["700"],
});

const siteUrl = "https://procusghana.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteInfo.name} | ${siteInfo.tagline}`,
    template: `%s | ${siteInfo.shortName}`,
  },
  description:
    "Procus Ghana Limited is one of the fastest-growing FMCG companies in Ghana, manufacturing the Kivo range of natural spices and gari mixes and distributing Mutlu pasta and Kivo Baked Beans.",
  openGraph: {
    title: siteInfo.name,
    description: siteInfo.tagline,
    url: siteUrl,
    siteName: siteInfo.name,
    locale: "en_GH",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${poppins.variable} ${ptSerif.variable}`}>
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
