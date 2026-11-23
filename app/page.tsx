import Image from "next/image";
import Link from "next/link";
import Button from "@/components/Button";
import Heading from "@/components/Heading";
import HeroSlider from "@/components/HeroSlider";
import FeaturedProducts from "@/components/FeaturedProducts";
import AmbassadorCard from "@/components/AmbassadorCard";
import Testimonials from "@/components/Testimonials";
import ContactForm from "@/components/ContactForm";
import { brands, heroSlides, reachFormFields, testimonials } from "@/lib/siteData";
import { getContent, resolveFeatured } from "@/lib/content/store";
import ambassadorStyles from "@/components/AmbassadorCard.module.css";
import styles from "./page.module.css";

// The ambassadors are edited from the admin panel, so render on every request.
export const dynamic = "force-dynamic";

export default async function Home() {
  const kivo = brands[0];
  const content = await getContent();
  const { ambassadors } = content;
  const featured = resolveFeatured(content);

  return (
    <div className={styles.main}>
      <HeroSlider slides={heroSlides} />

      <section className={styles.alook}>
        <div className="container">
          <div className={styles.alookRow}>
            <div>
              <Heading eyebrow="What we do" title="Food That Nourishes Your Soul" />
              <p>
                Procus is one of the fastest-growing FMCG companies in Ghana. At Procus, we bring quality food to
                your table that nourishes your body and soul with its taste and nutrition.
              </p>
              <p>
                At Procus, we maintain a wide and ever-expanding distribution network within the country to ensure
                that our nourishing products are within easy reach of the consumer in terms of availability and
                affordability. We are committed to procuring and producing locally in Ghana while harnessing our
                strength in generating value from global supply chains.
              </p>
              <p>
                The highest standards of quality are ensured for all the products produced and packed by us. All
                our products are approved by the Food and Drugs Authority of Ghana.
              </p>
            </div>
            <Image src="/assets/misc/what-we-do-2026.jpg" alt="The Kivo range: gari soaking mixes, hot pepper, shito, creamer, chocolate drink and baked beans" width={1600} height={1060} />
          </div>
        </div>
      </section>

      <section className="container">
        <div className={styles.brands}>
          <div>
            <Heading eyebrow="Our Brand" title="The brand that is trusted and loved" />
            <p>
              We bring you diversified and delicious food so you can enjoy the best from the comfort of your home.
              Our Kivo range includes natural spice powders, gari soaking mixes, non-dairy creamer, baked beans and
              convenient local foods made for households across Ghana.
            </p>
          </div>
          <div className={styles.brandLogos}>
            <Link href={`/brands/${kivo.slug}`}>
              <Image src={kivo.logo} alt="KIVO" width={166} height={85} />
            </Link>
          </div>
        </div>
      </section>

      {featured.length ? (
        <section className={`container ${styles.featured}`}>
          <Heading eyebrow="Our Products" title="Featured Products" />
          <FeaturedProducts items={featured} />
        </section>
      ) : null}

      <section className="container">
        <div className={styles.lives}>
          <Heading eyebrow="How We Touch Lives" title="Bringing cheer to households across Ghana" />
          <p>
            Since Inception, we at Procus have remained focused on offering premium quality and affordable
            products. We have been impacting the lives of people living in Ghana and will continue to do so with
            our upcoming range. We are constantly evolving and are adding new products to our line, that are novel
            ways of meeting the requirements of the customers, making us an umbrella stop for all your FMCG needs.
          </p>
        </div>
      </section>

      <section className={`container ${styles.ambassadors}`}>
        <Heading eyebrow="Our Brand" title="Ambassadors" />
        <div className={ambassadorStyles.grid}>
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

      <section className={styles.packaging}>
        <Image
          src="/assets/misc/our-packaging.svg"
          alt="Procus packaging"
          width={717}
          height={774}
          className={styles.packagingImage}
        />
        <div className="container">
          <div className={styles.packagingText}>
            <Heading eyebrow="Our packaging" title="Freshness and Convenience" />
            <p>
              Our products are made available in a range of pack sizes that make it easy for consumers to store
              and use as per their household requirements. Packaging efforts at Procus ensure that the
              nutritional value of the product is not compromised, all the time bringing ease of use to the
              consumers.
            </p>
            <Button href="/brands" variant="white">
              Discover More
            </Button>
          </div>
        </div>
      </section>

      <section className={`container ${styles.happyCustomers}`}>
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
