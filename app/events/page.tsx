import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import { getContent } from "@/lib/content/store";
import { isUploadedImage } from "@/lib/content/image";
import { formatPostDate } from "@/lib/content/format";
import styles from "./events.module.css";

// Content is edited from the admin panel, so render on every request.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { eventsPage } = await getContent();
  return {
    title: eventsPage.title,
    description: eventsPage.intro || "Events, press releases and news from Procus Ghana Limited and Kivo.",
  };
}

export default async function EventsPage() {
  const { eventsPage, posts } = await getContent();
  const published = posts.filter((post) => post.published);

  return (
    <div>
      <PageHeader title={eventsPage.title} image="/assets/hero/events-header-bg.png" />

      <section className={styles.sectionPad}>
        <div className="container">
          {eventsPage.intro ? <p className={styles.intro}>{eventsPage.intro}</p> : null}

          {published.length === 0 ? (
            <p className={styles.empty}>There are no events or news yet. Please check back soon.</p>
          ) : (
            <ul className={styles.postGrid}>
              {published.map((post) => (
                <li key={post.slug}>
                  <Link href={`/events/${post.slug}`} className={styles.postCard}>
                    <div className={styles.postImage}>
                      <Image
                        src={post.image}
                        alt={post.imageAlt || post.title}
                        fill
                        sizes="(max-width: 700px) 100vw, 420px"
                        style={{ objectFit: "cover" }}
                        unoptimized={isUploadedImage(post.image)}
                      />
                    </div>
                    <div className={styles.postText}>
                      <p className={styles.postMeta}>
                        {post.label ? <span>{post.label}</span> : null}
                        {post.date ? <time dateTime={post.date}>{formatPostDate(post.date)}</time> : null}
                      </p>
                      <h2>{post.title}</h2>
                      {post.summary ? <p>{post.summary}</p> : null}
                      <span className={styles.readMore}>Read more →</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
