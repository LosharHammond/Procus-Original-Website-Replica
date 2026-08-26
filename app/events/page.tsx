import type { Metadata } from "next";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import Heading from "@/components/Heading";
import { eventPost } from "@/lib/siteData";
import styles from "./events.module.css";

export const metadata: Metadata = {
  title: "Events",
  description: eventPost.title,
};

export default function EventsPage() {
  return (
    <div>
      <PageHeader title="Events" image="/assets/hero/events-header-bg.png" />

      <section className={styles.sectionPad}>
        <div className="container">
          <Heading eyebrow={eventPost.eyebrow} title={eventPost.title} />

          <Image
            src={eventPost.image}
            alt="Mohammed Kudus signs as Kivo brand ambassador"
            width={1200}
            height={700}
            className={styles.image}
          />

          <div className={styles.description}>
            {eventPost.paragraphs.map((paragraph, i) => {
              if (paragraph.type === "text") {
                return <p key={i}>{paragraph.text}</p>;
              }
              if (paragraph.type === "quote") {
                return (
                  <p key={i}>
                    {paragraph.before}
                    <span className={styles.quote}>&ldquo;{paragraph.quote}&rdquo;</span>
                    {paragraph.after}
                  </p>
                );
              }
              return (
                <p key={i}>
                  {paragraph.before}
                  <span className="gradientText">{paragraph.highlight}</span>
                  {paragraph.after}
                </p>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
