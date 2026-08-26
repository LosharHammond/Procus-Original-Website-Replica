import type { Testimonial } from "@/lib/siteData";
import styles from "./Testimonials.module.css";

export default function Testimonials({ items }: { items: Testimonial[] }) {
  return (
    <div className={styles.grid}>
      {items.map((t) => (
        <div key={t.handle} className={styles.card}>
          <div className={styles.handleRow}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/assets/icons/social/${t.platform}-dark.svg`}
              alt={t.platform === "instagram" ? "Instagram" : "Facebook"}
            />
            <h3>{t.handle}</h3>
          </div>
          <p>{t.quote}</p>
        </div>
      ))}
    </div>
  );
}
