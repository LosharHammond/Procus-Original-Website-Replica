import type { ReactNode } from "react";
import styles from "./PageHeader.module.css";

type PageHeaderProps = {
  title: string;
  subtitle?: ReactNode;
  image: string;
};

export default function PageHeader({ title, subtitle, image }: PageHeaderProps) {
  return (
    <div
      className={styles.header}
      style={{
        backgroundImage: `url(${image}), linear-gradient(90deg, #008c46 3.49%, #97cb4f)`,
      }}
    >
      <div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
    </div>
  );
}
