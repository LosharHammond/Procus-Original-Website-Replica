"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/lib/siteData";
import styles from "./FeaturedProducts.module.css";

export default function FeaturedProducts({ products }: { products: Product[] }) {
  const [active, setActive] = useState(0);
  const product = products[active];

  return (
    <div>
      <div className={styles.tabs} role="tablist" aria-label="Featured products">
        {products.map((p, i) => (
          <button
            key={p.slug}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={[styles.tab, i === active ? styles.tabActive : ""].join(" ")}
            onClick={() => setActive(i)}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className={styles.panel}>
        <div>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
        </div>
        <div className={styles.imageContainer}>
          <Image
            src={product.image}
            alt={product.imageAlt}
            fill
            sizes="(max-width: 1200px) 90vw, 40vw"
            style={{ objectFit: "contain" }}
          />
        </div>
      </div>
    </div>
  );
}
