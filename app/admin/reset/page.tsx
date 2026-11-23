import type { Metadata } from "next";
import ResetForm from "@/components/admin/ResetForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reset admin password",
  robots: { index: false, follow: false },
  // Keep the reset link out of the Referer header sent to other sites.
  referrer: "no-referrer",
};

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <ResetForm token={typeof token === "string" ? token : ""} />;
}
