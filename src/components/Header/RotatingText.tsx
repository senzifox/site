"use client";

import { useEffect, useState } from "react";
import styles from "./Header.module.css";

const SHOW_MS = 3600;
const FADE_MS = 600;

export function RotatingText({ items }: { items: string[] }) {
  const [index, setIndex] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (items.length < 2) return;
    let swap: ReturnType<typeof setTimeout>;
    const cycle = setInterval(() => {
      setHidden(true);
      swap = setTimeout(() => {
        setIndex((current) => (current + 1) % items.length);
        setHidden(false);
      }, FADE_MS);
    }, SHOW_MS + FADE_MS);
    return () => {
      clearInterval(cycle);
      clearTimeout(swap);
    };
  }, [items.length]);

  return (
    <span className={hidden ? `${styles.rotating} ${styles.hidden}` : styles.rotating}>{items[index]}</span>
  );
}
