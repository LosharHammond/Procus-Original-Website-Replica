import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/siteData";
import styles from "./ProductCard.module.css";

export default function ProductCard({ brandSlug, product }: { brandSlug: string; product: Product }) {
  return (
    <Link href={`/brands/${brandSlug}/${product.slug}`} className={styles.card}>
      <div className={styles.imageWrap}>
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          sizes="(max-width: 700px) 100vw, 260px"
          style={{ objectFit: "contain" }}
        />
      </div>
      <div className={styles.details}>
        <h3>{product.name}</h3>
        <p className={styles.sizes}>Available in {product.sizes}</p>
      </div>
    </Link>
  );
}
