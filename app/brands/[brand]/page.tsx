import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Heading from "@/components/Heading";
import ProductCard from "@/components/ProductCard";
import Testimonials from "@/components/Testimonials";
import ContactForm from "@/components/ContactForm";
import { brands, getBrand, reachFormFields, testimonials } from "@/lib/siteData";
import styles from "../brands.module.css";

function smallestPackWeight(sizes: string) {
  const weights = Array.from(sizes.matchAll(/(\d+(?:\.\d+)?)\s*g\b/gi), (match) => Number(match[1]));
  return weights.length ? Math.min(...weights) : Number.POSITIVE_INFINITY;
}

export function generateStaticParams() {
  return brands.map((brand) => ({ brand: brand.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand: brandSlug } = await params;
  const brand = getBrand(brandSlug);
  if (!brand) return {};
  return {
    title: brand.name,
    description: brand.description,
  };
}

export default async function BrandPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: brandSlug } = await params;
  const brand = getBrand(brandSlug);
  if (!brand) notFound();

  return (
    <div>
      <header className={styles.coverHeader}>
        <Image src={brand.cover} alt="Brand Cover" width={1200} height={600} />
      </header>

      <div className="container">
        {brand.categories.map((category) => {
          const productsByWeight = [...category.products].sort(
            (left, right) => smallestPackWeight(left.sizes) - smallestPackWeight(right.sizes),
          );

          return (
            <section className={styles.productContainer} key={category.name}>
              <div className={styles.categoryHeading}>
                <h2>{category.name}</h2>
                <span>{category.products.length} {category.products.length === 1 ? "product" : "products"}</span>
              </div>
              <ul className={styles.productGrid}>
                {productsByWeight.map((product) => (
                <li key={product.slug}>
                  <ProductCard brandSlug={brand.slug} product={product} />
                </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <section className="container">
        <Heading eyebrow="Join our" title="Happy customers" center />
        <Testimonials items={testimonials} />
      </section>

      <ContactForm
        title="Partner with us"
        description="If you are interested in partnering with us as a supplier, distributor or want to collaborate with us, reach out to us below:"
        {...reachFormFields}
      />
    </div>
  );
}
