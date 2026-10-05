import styles from "./Footer.module.css";
import { Tail } from "./Tail";

export function Footer({ text }: { text: string }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.divider} aria-hidden="true">
        <span className={styles.line} />
        <Tail />
        <span className={`${styles.line} ${styles.lineEnd}`} />
      </div>
      <span className={styles.text}>{text}</span>
    </footer>
  );
}
