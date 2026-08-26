import Link from "next/link";
import { footerColumns, siteInfo, socialLinks } from "@/lib/siteData";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div>
            <h3>Questions</h3>
            <p>Contact us online or by phone</p>
            <ul>
              <li>
                <a href={siteInfo.phoneHref} className={styles.row}>
                  {siteInfo.phone}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3>{footerColumns.consumers.label}</h3>
            <ul>
              <li>
                <a href={footerColumns.consumers.href} target="_blank" rel="noopener noreferrer">
                  {footerColumns.consumers.linkLabel}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3>{footerColumns.media.label}</h3>
            <ul>
              <li>
                <Link href={footerColumns.media.href}>{footerColumns.media.linkLabel}</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3>{footerColumns.careers.label}</h3>
            <ul>
              {footerColumns.careers.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>Stay Connected</h3>
            <ul>
              <li className={styles.logos}>
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/icons/social/facebook.svg" alt="" width={22} height={22} />
                </a>
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/icons/social/instagram.svg" alt="" width={22} height={22} />
                </a>
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/icons/social/linkedin.svg" alt="" width={22} height={22} />
                </a>
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/icons/social/youtube.svg" alt="" width={22} height={22} />
                </a>
              </li>
            </ul>
            <div className={styles.fdaBadge}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/icons/fda.svg" alt="Food and Drugs Authority of Ghana approved" />
            </div>
          </div>
        </div>

        <hr className={styles.bottomRule} />
        <p className={styles.copyright}>© {new Date().getFullYear()} {siteInfo.name}. All Rights Reserved</p>
      </div>
    </footer>
  );
}
