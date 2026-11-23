import Link from "next/link";
import Image from "next/image";
import { isUploadedImage } from "@/lib/content/image";
import styles from "./AmbassadorCard.module.css";

type AmbassadorCardProps = {
  name: string;
  role?: string;
  image: string;
  blurb: string;
  href?: string;
};

/** First letters of the first and last word, e.g. "Nana Ama McBrown" → "NM". */
function initials(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}

export default function AmbassadorCard({ name, role, image, blurb, href }: AmbassadorCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.imageContainer}>
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 25vw"
            unoptimized={isUploadedImage(image)}
          />
        ) : (
          <div className={styles.placeholder} aria-hidden="true">
            {initials(name)}
          </div>
        )}
      </div>
      <div className={styles.text}>
        <p className={styles.name}>{name}</p>
        {role ? <p className={styles.role}>{role}</p> : null}
        <p className={styles.description}>{blurb}</p>
        {href ? (
          <Link href={href} className={styles.link}>
            Read More →
          </Link>
        ) : null}
      </div>
    </article>
  );
}
