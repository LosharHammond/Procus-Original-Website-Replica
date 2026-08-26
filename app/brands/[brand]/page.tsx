import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Heading from "@/components/Heading";
import ProductCard from "@/components/ProductCard";
import Testimonials from "@/components/Testimonials";
import ContactForm from "@/components/ContactForm";
import { brands, getBrand, reachFormFields, testimonials } from "@/lib/siteData";
import styles from "../brands.module.css";

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
        {brand.categories.map((category) => (
          <div className={styles.productContainer} key={category.name}>
            <h2>{category.name}</h2>
            <ul className={styles.productGrid}>
              {category.products.map((product) => (
                <li key={product.slug}>
                  <ProductCard brandSlug={brand.slug} product={product} />
                </li>
              ))}
            </ul>
          </div>
        ))}
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
