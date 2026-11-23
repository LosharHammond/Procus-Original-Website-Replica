import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Heading from "@/components/Heading";
import ProductCard from "@/components/ProductCard";
import Testimonials from "@/components/Testimonials";
import ContactForm from "@/components/ContactForm";
import { reachFormFields, testimonials } from "@/lib/siteData";
import { getBrandContent } from "@/lib/content/store";
import { isUploadedImage } from "@/lib/content/image";
import styles from "../brands.module.css";

// Content is edited from the admin panel, so render on every request.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand: brandSlug } = await params;
  const brand = await getBrandContent(brandSlug);
  if (!brand) return {};
  return {
    title: brand.name,
    description: brand.description,
  };
}

export default async function BrandPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: brandSlug } = await params;
  const brand = await getBrandContent(brandSlug);
  if (!brand) notFound();

  return (
    <div>
      <header className={styles.coverHeader}>
        <Image src={brand.cover} alt={`${brand.name} product range`} width={1200} height={600} loading="eager" fetchPriority="high" unoptimized={isUploadedImage(brand.cover)} />
      </header>

      <div className="container">
        {brand.categories.map((category) => {
          // Products are shown in the order set in the admin panel.
          return (
            <section className={styles.productContainer} key={category.name}>
              <div className={styles.categoryHeading}>
                <h2>{category.name}</h2>
                <span>{category.products.length} {category.products.length === 1 ? "product" : "products"}</span>
              </div>
              <ul className={styles.productGrid}>
                {category.products.map((product) => (
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
