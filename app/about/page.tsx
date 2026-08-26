import type { Metadata } from "next";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import Heading from "@/components/Heading";
import ContactForm from "@/components/ContactForm";
import { reachFormFields } from "@/lib/siteData";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "Our Company",
  description:
    "Procus started operations in early 2020 with one goal of improving and touching the lives of people in Ghana. Learn about our purpose, values and culture.",
};

const values = [
  {
    title: "Courage to lead",
    description: "Speak up fearlessly, take calculated risks, try out new approaches",
  },
  {
    title: "Ownership at work",
    description: "Demonstrate accountability, display reliability, own up to success and failures",
  },
  {
    title: "Respect for others",
    description: "Promote inclusivity, be approachable, give people voice and freedom, listen to stakeholders",
  },
  {
    title: "Deliver an exceptional experience",
    description: "Focus on differentiated products and services, create value beyond expected, seek high-quality standards",
  },
];

export default function AboutPage() {
  return (
    <div className={styles.main}>
      <PageHeader title="About Us" image="/assets/hero/about-header-bg.png" />

      <section className={`container ${styles.company}`}>
        <div>
          <div>
            <Heading eyebrow="Our Company" title="Expanding Boundaries" />
            <p>
              Procus started operations in early 2020 with one goal of improving and touching the lives of people
              in Ghana. We continue to grow as one of the country&apos;s most trusted brands. Our products provide
              value for money, high quality, great taste and convenient packaging that makes the lives of our
              consumers more enriching.
            </p>
            <p>
              We are driven by our experienced employees who are qualified with knowledge and experience in
              sales, manufacturing, marketing, supply chain and distribution business. Our warehouses, which have
              been checked and approved by the Food and Drugs Authority of Ghana are well designed to ensure
              proper storage and safety of all products.
            </p>
          </div>
          <Image src="/assets/about/company.png" alt="Procus Ghana team" width={640} height={480} />
        </div>
      </section>

      <section className={`container ${styles.purpose}`}>
        <div>
          <Image src="/assets/about/purpose.png" alt="Our purpose" width={600} height={480} />
          <div>
            <Heading eyebrow="Our Purpose" title="Enhancing Lives Through Novel Food Solutions" />
            <p>
              Our goal is to be at the heart of every household in Ghana. With quality, perseverance, and
              competence, we strive to enhance the lives of those whom we impact through our products, now and for
              generations to come. We do this by a focus on our products that meet or exceed the needs of our
              customers, constantly looking for novel ways to exceed expectations.
            </p>
          </div>
        </div>
      </section>

      <section className={`container ${styles.values}`}>
        <Heading title="Our Values" />
        <ul className={styles.valuesList}>
          {values.map((value) => (
            <li key={value.title}>
              {value.title}
              <ul>
                <li>{value.description}</li>
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section className={`container ${styles.culture}`}>
        <Heading title="Our Culture" />
        <div className={styles.cultureDiv}>
          <span>The binding glue that makes us resilient</span>
          <p>
            We are driven, progressive, and innovative and refuse to maintain the status quo. <br />
            As a team, we collaborate and celebrate our triumphs together. We constantly look for ways to enhance
            the lives of our employees by providing them opportunities to grow in their chosen areas of competency
            and interest.
          </p>
        </div>
        <Image src="/assets/about/culture.png" alt="Procus Ghana culture" width={1200} height={600} />
      </section>

      <ContactForm
        title="Partner with us"
        description="If you are interested in partnering with us as a supplier, distributor or want to collaborate with us, reach out to us below:"
        {...reachFormFields}
      />
    </div>
  );
}
