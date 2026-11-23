import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Heading from "@/components/Heading";
import Testimonials from "@/components/Testimonials";
import ContactForm from "@/components/ContactForm";
import { reachFormFields, testimonials } from "@/lib/siteData";
import { getProductContent } from "@/lib/content/store";
import { isUploadedImage } from "@/lib/content/image";
import styles from "../../brands.module.css";

// Content is edited from the admin panel, so render on every request.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string; product: string }>;
}): Promise<Metadata> {
  const { brand: brandSlug, product: productSlug } = await params;
  const found = await getProductContent(brandSlug, productSlug);
  if (!found) return {};
  return {
    title: found.product.name,
    description:
      found.product.description ||
      `${found.product.name} from ${found.brand.name}${found.product.sizes ? `, available in ${found.product.sizes}` : ""}.`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ brand: string; product: string }>;
}) {
  const { brand: brandSlug, product: productSlug } = await params;
  const found = await getProductContent(brandSlug, productSlug);
  if (!found) notFound();
  const { brand, product } = found;
  const productImages = product.images?.length ? product.images : [product.image];

  return (
    <div>
      <header className={styles.coverHeader}>
        <Image src={brand.cover} alt={`${brand.name} product range`} width={1200} height={600} loading="eager" fetchPriority="high" unoptimized={isUploadedImage(brand.cover)} />
      </header>

      <section className="container">
        <div className={styles.productDetails}>
          <div className={styles.productGallery}>
            {productImages.map((image, index) => (
              <Image
                key={image}
                src={image}
                alt={index === 0 ? product.imageAlt : `${product.imageAlt} pack ${index + 1}`}
                width={500}
                height={500}
                className={styles.productImage}
                unoptimized={isUploadedImage(image)}
              />
            ))}
          </div>
          <div className={styles.productInfo}>
            <span className={styles.productNameLabel}>Product Name</span>
            <h2>{product.name}</h2>
            {product.description ? <p>{product.description}</p> : null}
            {product.sizes ? (
              <ul className={styles.specList}>
                <li>
                  <span>Available Sizes</span>
                  {product.sizes}
                </li>
              </ul>
            ) : null}
          </div>
        </div>
      </section>

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
