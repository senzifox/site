import Link from "next/link";
import styles from "./HomeLink.module.css";

type Props = { className?: string; href?: string; label?: string };

export function HomeLink({ className, href = "/", label = "$ cd ~" }: Props) {
  return (
    <Link className={className ? `${styles.link} ${className}` : styles.link} href={href}>
      {label}
    </Link>
  );
}
