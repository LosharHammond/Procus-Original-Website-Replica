"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Button from "./Button";
import { navLinks } from "@/lib/siteData";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <nav className={styles.nav} data-open={open}>
          <Link href="/" className={styles.logo} aria-label="Procus Ghana home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logo/procus-logo.svg" alt="Procus" width={80} height={54} />
          </Link>

          <ul className={styles.links} data-open={open}>
            {navLinks.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={isActive ? styles.activeLink : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className={styles.buttonArea}>
            <Button href="/contact">Contact</Button>
          </div>

          <button
            type="button"
            className={styles.hamburger}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
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
