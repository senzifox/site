import type { Metadata } from "next";
import { Background } from "@/components/Background/Background";
import { Card } from "@/components/Card/Card";
import { HomeLink } from "@/components/HomeLink/HomeLink";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <Background />
      <main className={styles.main}>
        <Card className={styles.card}>
          <span className={styles.code}>404</span>
          <p className={styles.text}>такой страницы нет(</p>
          <HomeLink className={styles.link} />
        </Card>
      </main>
    </>
  );
}
