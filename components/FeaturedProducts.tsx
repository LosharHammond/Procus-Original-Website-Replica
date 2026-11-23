"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import Button from "@/components/Button";
import type { ProductContent } from "@/lib/content/types";
import { isUploadedImage } from "@/lib/content/image";
import styles from "./FeaturedProducts.module.css";

type FeaturedItem = {
  brandSlug: string;
  product: ProductContent;
};

/**
 * Homepage "Featured Products": tabs with the product names, then the product's
 * text on the left and its picture on the right — the same two-column layout as
 * the "What we do" section above it.
 */
export default function FeaturedProducts({ items }: { items: FeaturedItem[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  if (items.length === 0) return null;

  const index = Math.min(active, items.length - 1);
  const { brandSlug, product } = items[index];

  // Arrow keys move between products, as in any tab list.
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const last = items.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowRight") next = index === last ? 0 : index + 1;
    if (event.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <div>
      {items.length > 1 ? (
        <div className={styles.tabs} role="tablist" aria-label="Featured products" onKeyDown={onKeyDown}>
          {items.map((item, i) => (
            <button
              key={`${item.brandSlug}/${item.product.slug}`}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              id={`featured-tab-${i}`}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-controls="featured-panel"
              tabIndex={i === index ? 0 : -1}
              className={i === index ? `${styles.tab} ${styles.tabActive}` : styles.tab}
              onClick={() => setActive(i)}
            >
              {item.product.name}
            </button>
          ))}
        </div>
      ) : null}

      <div
        className={styles.panel}
        id="featured-panel"
        role={items.length > 1 ? "tabpanel" : undefined}
        aria-labelledby={items.length > 1 ? `featured-tab-${index}` : undefined}
      >
        <div className={styles.text} key={`text-${brandSlug}/${product.slug}`}>
          <h3>{product.name}</h3>
          {product.description ? <p>{product.description}</p> : null}
          {product.sizes ? (
            <p className={styles.sizes}>
              <span>Available in</span> {product.sizes}
            </p>
          ) : null}
          <Button href={`/brands/${brandSlug}/${product.slug}`}>View Product</Button>
        </div>

        <div className={styles.imageContainer}>
          <div className={styles.imageInner} key={`image-${brandSlug}/${product.slug}`}>
            <Image
              src={product.image}
              alt={product.imageAlt || product.name}
              fill
              sizes="(max-width: 1200px) 90vw, 600px"
              style={{ objectFit: "contain" }}
              unoptimized={isUploadedImage(product.image)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
