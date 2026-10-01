"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks } from "@/lib/siteData";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <nav className={styles.nav} data-open={open}>
          <Link href="/" className={styles.logo} aria-label="Procus Ghana home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logo/procus-logo.svg" alt="Procus" width={80} height={54} />
          </Link>

          <ul className={styles.links} id="primary-navigation" data-open={open}>
            {navLinks.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={isActive ? styles.activeLink : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            <li className={styles.mobileContact}>
              <Link href="/contact" onClick={() => setOpen(false)} className={styles.contactButton}>
                Contact
              </Link>
            </li>
          </ul>

          <div className={styles.buttonArea}>
            <Link href="/contact" className={styles.contactButton}>Contact</Link>
          </div>

          <button
            type="button"
            className={styles.hamburger}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="primary-navigation"
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </nav>
      </div>
    </div>
  );
}
