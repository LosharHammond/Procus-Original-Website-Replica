import type { Metadata } from "next";
import Image from "next/image";
import Button from "@/components/Button";
import Heading from "@/components/Heading";
import ContactForm from "@/components/ContactForm";
import { resumeFormFields } from "@/lib/siteData";
import styles from "./careers.module.css";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Want to join hands with the innovative and young FMCG Brand of Ghana to transform the food industry? Explore career opportunities with Procus.",
};

export default function CareersPage() {
  return (
    <div className={styles.main}>
      <header
        className={styles.hero}
        style={{
          backgroundImage: "url(/assets/hero/careers-header-bg.png), linear-gradient(90deg, #008c46 3.49%, #97cb4f)",
        }}
      >
        <div className="container">
          <h1>
            <span className={styles.kicker}>Careers</span>
            Where Passion Meets a Nurturing Environment
          </h1>
          <p>
            Want to join hands with the innovative and young FMCG Brand of Ghana to transform the food industry?
            Read on and explore opportunities with Procus.
          </p>
          <Button href="#resume-form">Explore opportunities</Button>
        </div>
      </header>

      <section className={`container ${styles.opportunities}`}>
        <Heading title="Our Work Culture" center />
        <Heading eyebrow="Opportunities for Employees" title="Nurturing Ecosystem" />
        <p>
          We believe our employees can make us or break us. Thus, we can only thrive when we grow together.
          Procus&apos; expert team will help you channel your skills in the right direction. Preparing you to be
          the leader of tomorrow. With Procus, your voice matters! Apply today if you love to take initiative,
          display entrepreneurial thinking and enjoy working as a part of a team
        </p>
        <span className={styles.quote}>
          &ldquo;Diversity and inclusivity reside at the heart of Procus. We believe it is the only way we can
          develop a deep understanding of the people we work with and the consumers we work for. &rdquo;
        </span>
      </section>

      <section className={`container ${styles.why}`}>
        <div>
          <div>
            <Heading eyebrow="Why should you" title="Join Procus?" />
            <p>
              You matter here! While you will hustle to attain goals, quality and timelines, you also get an
              opportunity to do so while maintaining a balance between work and life outside of work. Even at the
              office, you have a family away from home that you can rely upon. We provide exciting and
              entrepreneurial opportunities for people to explore their potential through multiple managerial,
              functional, technical and support roles. We promote curiosity and desire to discover better ways of
              doing work and enhancing the lives around us. Join us if you want to make a difference!
            </p>
          </div>
          <Image src="/assets/careers/join.png" alt="Join Procus" width={640} height={480} />
        </div>
      </section>

      <ContactForm
        id="resume-form"
        formName="careers"
        title="Join the team"
        description="Interested to work with Procus? Please submit your profile by filling in the details given below"
        showContactDetails={false}
        {...resumeFormFields}
      />
    </div>
  );
}
