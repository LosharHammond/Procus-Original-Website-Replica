import Image from "next/image";
import Link from "next/link";
import Button from "@/components/Button";
import Heading from "@/components/Heading";
import HeroSlider from "@/components/HeroSlider";
import FeaturedProducts from "@/components/FeaturedProducts";
import AmbassadorCard from "@/components/AmbassadorCard";
import Testimonials from "@/components/Testimonials";
import ContactForm from "@/components/ContactForm";
import { ambassador, brands, featuredProducts, heroSlides, reachFormFields, testimonials } from "@/lib/siteData";
import styles from "./page.module.css";

export default function Home() {
  const kivo = brands[0];
  const mutlu = brands[1];

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
            <Image src="/assets/misc/what-we-do.png" alt="What we do" width={640} height={480} />
          </div>
        </div>
      </section>

      <section className="container">
        <div className={styles.brands}>
          <div>
            <Heading eyebrow="Our Brands" title="The brands that are trusted and loved" />
            <p>
              We bring you diversified and delicious food so you can enjoy the best, while sitting in the comfort
              of your home. We are the official manufacturers of Kivo Hot pepper, Kivo 4-in-1 Gari Soaking Mix,
              Kivo Non-dairy Creamer, Kivo Ginger powder, Kivo Curry Powder. Additionally, we distribute Mutlu
              Spaghetti and Kivo Baked Beans.
            </p>
          </div>
          <div className={styles.brandLogos}>
            <Link href={`/brands/${kivo.slug}`}>
              <Image src={kivo.logo} alt="KIVO" width={130} height={80} />
            </Link>
            <Link href={`/brands/${mutlu.slug}`}>
              <Image src={mutlu.logo} alt="Mutlu" width={130} height={80} />
            </Link>
          </div>
        </div>
      </section>

      <section className={`container ${styles.featured}`}>
        <Heading title="Featured Products" />
        <FeaturedProducts products={featuredProducts} />
      </section>

      <section className="container">
        <div className={styles.lives}>
          <Heading eyebrow="How We Touch Lives" title="Bringing cheer to households across Ghana" center />
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
        <AmbassadorCard
          name={ambassador.name}
          image={ambassador.image}
          blurb={ambassador.blurb}
          href={ambassador.href}
        />
      </section>

      <section className={styles.packaging}>
        <Image
          src="/assets/misc/our-packaging.svg"
          alt="Procus packaging"
          width={600}
          height={500}
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
