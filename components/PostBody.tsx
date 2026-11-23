import type { PostBlock } from "@/lib/content/types";
import styles from "@/app/events/events.module.css";

export default function PostBody({ blocks }: { blocks: PostBlock[] }) {
  return (
    <div className={styles.description}>
      {blocks.map((block, i) => {
        if (block.type === "text") {
          return <p key={i}>{block.text}</p>;
        }
        if (block.type === "quote") {
          return (
            <p key={i}>
              {block.before}
              <span className={styles.quote}>&ldquo;{block.quote}&rdquo;</span>
              {block.after}
            </p>
          );
        }
        return (
          <p key={i}>
            {block.before}
            <span className="gradientText">{block.highlight}</span>
            {block.after}
          </p>
        );
      })}
    </div>
  );
}
