import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import Heading from "@/components/Heading";
import Testimonials from "@/components/Testimonials";
import ContactForm from "@/components/ContactForm";
import { reachFormFields, testimonials } from "@/lib/siteData";
import { getContent } from "@/lib/content/store";
import { isUploadedImage } from "@/lib/content/image";
import AmbassadorCard from "@/components/AmbassadorCard";
import ambassadorStyles from "@/components/AmbassadorCard.module.css";
import styles from "./brands.module.css";

export const metadata: Metadata = {
  title: "Our Brands",
  description:
    "We are the official manufacturers of Kivo Hot pepper, Kivo 4-in-1 Gari Soaking Mix, Kivo Non-dairy Creamer, Kivo Ginger powder and Kivo Curry Powder, and distributors of Mutlu pasta.",
};

// Content is edited from the admin panel, so render on every request.
export const dynamic = "force-dynamic";

export default async function BrandsIndexPage() {
  const { brandsPage, brands, ambassadors } = await getContent();

  return (
    <div>
      <PageHeader title={brandsPage.title} image="/assets/hero/brands-header-bg.png" />

      <section className="container">
        <div className={styles.heading}>
          <Heading title={brandsPage.heading} center />
          {brandsPage.intro ? <p>{brandsPage.intro}</p> : null}
        </div>

        <div className={styles.brandList}>
          {brands.map((brand) => (
            <div key={brand.slug} className={styles.brandCard}>
              <Link href={`/brands/${brand.slug}`}>
                <Image
                  src={brand.cover}
                  alt={`${brand.name} Products`}
                  width={1200}
                  height={600}
                  className={styles.cover}
                  unoptimized={isUploadedImage(brand.cover)}
                />
                <div className={styles.brandCardFooter}>
                  <p className={styles.readMore}>
                    Read More
                    <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path
                        d="M9.72671 4.03934C9.67441 4.09158 9.63292 4.15362 9.60461 4.22191C9.57631 4.29019 9.56174 4.36339 9.56174 4.43731C9.56174 4.51123 9.57631 4.58443 9.60461 4.65271C9.63292 4.721 9.67441 4.78304 9.72671 4.83528L13.8294 8.93731L2.81218 8.93731C2.663 8.93731 2.51992 8.99657 2.41443 9.10206C2.30894 9.20755 2.24968 9.35063 2.24968 9.49981C2.24968 9.64899 2.30894 9.79207 2.41443 9.89756C2.51992 10.003 2.663 10.0623 2.81218 10.0623L13.8294 10.0623L9.72671 14.1643C9.62116 14.2699 9.56187 14.413 9.56187 14.5623C9.56187 14.7116 9.62116 14.8547 9.72671 14.9603C9.83226 15.0658 9.97541 15.1251 10.1247 15.1251C10.2739 15.1251 10.4171 15.0658 10.5226 14.9603L15.5851 9.89778C15.6374 9.84554 15.6789 9.7835 15.7072 9.71521C15.7356 9.64693 15.7501 9.57373 15.7501 9.49981C15.7501 9.42589 15.7356 9.35269 15.7072 9.28441C15.6789 9.21612 15.6374 9.15408 15.5851 9.10184L10.5226 4.03934C10.4704 3.98704 10.4084 3.94555 10.3401 3.91724C10.2718 3.88894 10.1986 3.87437 10.1247 3.87437C10.0508 3.87437 9.97756 3.88894 9.90928 3.91724C9.84099 3.94555 9.77895 3.98704 9.72671 4.03934Z"
                        fill="#008C46"
                      />
                    </svg>
                  </p>
                  <Image src={brand.logo} alt={brand.name} width={176} height={88} className={styles.mark} unoptimized={isUploadedImage(brand.logo)} />
                </div>
              </Link>
            </div>
          ))}
        </div>

        <Heading eyebrow="Our Brand" title="Ambassadors" />
        <div className={ambassadorStyles.grid} style={{ paddingBottom: "3rem" }}>
          {ambassadors.map((person, index) => (
            <AmbassadorCard
              key={`${index}-${person.name}`}
              name={person.name}
              role={person.role}
              image={person.image}
              blurb={person.blurb}
              href={person.link || undefined}
            />
          ))}
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
