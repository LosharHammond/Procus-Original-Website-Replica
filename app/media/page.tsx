import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import Heading from "@/components/Heading";
import Testimonials from "@/components/Testimonials";
import ContactForm from "@/components/ContactForm";
import { adverts, reachFormFields, testimonials } from "@/lib/siteData";
import styles from "./media.module.css";

export const metadata: Metadata = {
  title: "Media",
  description: "Watch the latest Kivo product commercials and adverts from Procus Ghana.",
};

export default function MediaPage() {
  return (
    <div className={styles.main}>
      <PageHeader title="Media" image="/assets/hero/media-header-bg.png" />

      <div className="container">
        <div className={styles.heading}>
          <Heading title="Adverts" />
        </div>

        <div className={styles.adverts}>
          {adverts.map((ad) => (
            <Link key={ad.slug} href={`/media/${ad.slug}`} className={styles.card}>
              {ad.title}
              <Image src={ad.thumbnail} alt={`${ad.title} thumbnail`} width={640} height={480} />
            </Link>
          ))}
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
