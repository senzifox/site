import { profile } from "@/content/profile";
import type { FooterContent } from "@/content/types";
import { commitUrl, build as current } from "@/lib/build";
import { BuildTime } from "./BuildTime";
import styles from "./Footer.module.css";
import { Tail } from "./Tail";

function BuildLine({ label }: { label: string }) {
  const url = commitUrl(profile.links.repo, current.sha);
  return (
    <span className={styles.build}>
      {label}{" "}
      {url ? (
        <a className={styles.link} href={url} target="_blank" rel="noopener noreferrer">
          {current.sha}
        </a>
      ) : (
        current.sha
      )}
      {" · "}
      <BuildTime time={current.time} timeZone={profile.timeZone} />
    </span>
  );
}

export function Footer({ text, link, build }: FooterContent) {
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
      {build && <BuildLine label={build} />}
    </footer>
  );
}
