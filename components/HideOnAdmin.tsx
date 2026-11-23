"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Hides the public site's navbar and footer inside the admin panel. */
export default function HideOnAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;
  return <>{children}</>;
}
