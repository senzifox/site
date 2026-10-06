import type { FooterContent } from "@/content/types";
import styles from "./Footer.module.css";
import { Tail } from "./Tail";

export function Footer({ text, link }: FooterContent) {
  return (
    <footer className={styles.footer}>
      <div className={styles.divider} aria-hidden="true">
        <span className={styles.line} />
        <Tail />
        <span className={`${styles.line} ${styles.lineEnd}`} />
      </div>
      <span className={styles.text}>
        {text}
        {link && (
          <>
            {" "}
            <a className={styles.link} href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
          </>
        )}
      </span>
    </footer>
  );
}
