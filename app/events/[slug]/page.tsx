import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import Heading from "@/components/Heading";
import PostBody from "@/components/PostBody";
import { getContent } from "@/lib/content/store";
import { isUploadedImage } from "@/lib/content/image";
import { formatPostDate } from "@/lib/content/format";
import styles from "../events.module.css";

export const dynamic = "force-dynamic";

async function findPost(slug: string) {
  const content = await getContent();
  const post = content.posts.find((p) => p.slug === slug && p.published);
  return post ? { post, pageTitle: content.eventsPage.title } : undefined;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const found = await findPost(slug);
  if (!found) return {};
  return { title: found.post.title, description: found.post.summary || found.post.title };
}

export default async function EventPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await findPost(slug);
  if (!found) notFound();
  const { post, pageTitle } = found;

  return (
    <div>
      <PageHeader title={pageTitle} image="/assets/hero/events-header-bg.png" />

      <section className={styles.sectionPad}>
        <div className="container">
          <p className={styles.backLink}>
            <Link href="/events">← All {pageTitle.toLowerCase()}</Link>
          </p>
          <Heading eyebrow={post.label} title={post.title} />
          {post.date ? (
            <p className={styles.postDate}>
              <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            </p>
          ) : null}

          <Image
            src={post.image}
            alt={post.imageAlt || post.title}
            width={1200}
            height={700}
            className={styles.image}
            unoptimized={isUploadedImage(post.image)}
          />

          <PostBody blocks={post.blocks} />
        </div>
      </section>
    </div>
  );
}
