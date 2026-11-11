import type { Lang } from "@/content/types";
import { LANGS } from "@/lib/lang";
import styles from "./LangSwitch.module.css";

const NAMES: Record<Lang, string> = { ru: "по-русски", en: "in english" };

type Props = { current: Lang; links: Partial<Record<Lang, string>> };

export function LangSwitch({ current, links }: Props) {
  const langs = LANGS.filter((lang) => links[lang]);
  if (langs.length < 2) return null;

  return (
    <nav className={styles.switch} aria-label="language">
      {langs.map((lang) =>
        lang === current ? (
          <span key={lang} className={`${styles.lang} ${styles.current}`} aria-current="page">
            {lang}
          </span>
        ) : (
          <a
            key={lang}
            className={styles.lang}
            href={links[lang]}
            hrefLang={lang}
            lang={lang}
            title={NAMES[lang]}
          >
            {lang}
          </a>
        ),
      )}
    </nav>
  );
}
