import styles from "./Footer.module.css";
import { Tail } from "./Tail";

type Props = { text: string; href?: string };

export function Footer({ text, href }: Props) {
  const content = text.replaceAll("{year}", String(new Date().getFullYear()));

  return (
    <footer className={styles.footer}>
      <div className={styles.divider} aria-hidden="true">
        <span className={styles.line} />
        <Tail />
        <span className={`${styles.line} ${styles.lineEnd}`} />
      </div>
      {href ? (
        <a className={`${styles.text} ${styles.link}`} href={href} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      ) : (
        <span className={styles.text}>{content}</span>
      )}
    </footer>
  );
}
