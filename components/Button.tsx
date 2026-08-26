import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type CommonProps = {
  children: ReactNode;
  variant?: "primary" | "white";
  fullWidth?: boolean;
  className?: string;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps & {
  href: string;
};

function classes(variant: CommonProps["variant"], fullWidth: boolean | undefined, className?: string) {
  return [styles.button, variant === "white" ? styles.white : "", fullWidth ? styles.fullWidth : "", className]
    .filter(Boolean)
    .join(" ");
}

export default function Button(props: ButtonAsButton | ButtonAsLink) {
  const { children, variant, fullWidth, className, ...rest } = props;

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes(variant, fullWidth, className)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes(variant, fullWidth, className)} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
