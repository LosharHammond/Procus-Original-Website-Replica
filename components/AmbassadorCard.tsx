import Link from "next/link";
import Image from "next/image";
import styles from "./AmbassadorCard.module.css";

type AmbassadorCardProps = {
  name: string;
  image: string;
  blurb: string;
  href: string;
};

export default function AmbassadorCard({ name, image, blurb, href }: AmbassadorCardProps) {
  return (
    <div className={styles.imageContainer}>
      <Image src={image} alt={name} fill sizes="(max-width: 768px) 100vw, 60vw" priority={false} />
      <div className={styles.textOverlay}>
        <p className={styles.name}>{name}</p>
        <p className={styles.description}>{blurb}</p>
        <Link href={href} className={styles.link}>
          Read More →
        </Link>
      </div>
    </div>
  );
}
