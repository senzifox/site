import Link from "next/link";
import styles from "./HomeLink.module.css";

export function HomeLink({ className }: { className?: string }) {
  return (
    <Link className={className ? `${styles.link} ${className}` : styles.link} href="/">
      $ cd ~
    </Link>
  );
}
