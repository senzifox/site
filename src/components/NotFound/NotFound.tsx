"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/Card/Card";
import { HomeLink } from "@/components/HomeLink/HomeLink";
import type { Lang } from "@/content/types";
import { DEFAULT_LANG, homePath, LANG_COOKIE, preferredLang } from "@/lib/lang";
import styles from "./NotFound.module.css";

const savedLang = () =>
  document.cookie
    .split("; ")
    .find((pair) => pair.startsWith(`${LANG_COOKIE}=`))
    ?.slice(LANG_COOKIE.length + 1);

export function NotFound({ texts }: { texts: Record<Lang, string> }) {
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    setLang(preferredLang(savedLang(), navigator.languages.join(",")) ?? DEFAULT_LANG);
  }, []);

  return (
    <main className={styles.main} lang={lang}>
      <Card className={styles.card}>
        <span className={styles.code}>404</span>
        <p className={styles.text}>{texts[lang]}</p>
        <HomeLink className={styles.link} href={homePath(lang)} />
      </Card>
    </main>
  );
}
