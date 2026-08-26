import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import Heading from "@/components/Heading";
import Testimonials from "@/components/Testimonials";
import ContactForm from "@/components/ContactForm";
import { adverts, reachFormFields, testimonials } from "@/lib/siteData";
import styles from "../media.module.css";

export function generateStaticParams() {
  return adverts.map((ad) => ({ slug: ad.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ad = adverts.find((a) => a.slug === slug);
  if (!ad) return {};
  return { title: ad.title };
}

export default async function AdvertPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ad = adverts.find((a) => a.slug === slug);
  if (!ad) notFound();

  return (
    <div className={styles.main}>
      <PageHeader title="Media" image="/assets/hero/media-header-bg.png" />

      <div className="container">
        <div className={styles.heading}>
          <Heading title={ad.title} />
          {ad.youtubeId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${ad.youtubeId}`}
              title={ad.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : null}
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
