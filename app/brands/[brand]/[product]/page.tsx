import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Heading from "@/components/Heading";
import Testimonials from "@/components/Testimonials";
import ContactForm from "@/components/ContactForm";
import { getAllProducts, getProduct, reachFormFields, testimonials } from "@/lib/siteData";
import styles from "../../brands.module.css";

export function generateStaticParams() {
  return getAllProducts().map(({ brand, product }) => ({
    brand: brand.slug,
    product: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string; product: string }>;
}): Promise<Metadata> {
  const { brand: brandSlug, product: productSlug } = await params;
  const found = getProduct(brandSlug, productSlug);
  if (!found) return {};
  return {
    title: found.product.name,
    description: found.product.description ?? `${found.product.name} from ${found.brand.name}, available in ${found.product.sizes}.`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ brand: string; product: string }>;
}) {
  const { brand: brandSlug, product: productSlug } = await params;
  const found = getProduct(brandSlug, productSlug);
  if (!found) notFound();
  const { brand, product } = found;

  return (
    <div>
      <header className={styles.coverHeader}>
        <Image src={brand.cover} alt="Brand Cover" width={1200} height={600} />
      </header>

      <div className={`container ${styles.productDetails}`}>
        <Image
          src={product.image}
          alt="Product Image"
          width={500}
          height={500}
          className={styles.productImage}
        />
        <div className={styles.productInfo}>
          <span className={styles.productNameLabel}>Product Name</span>
          <h2>{product.name}</h2>
          {product.description ? <p>{product.description}</p> : null}
          <ul className={styles.specList}>
            <li>
              <span>Available Sizes</span>
              {product.sizes}
            </li>
          </ul>
        </div>
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
