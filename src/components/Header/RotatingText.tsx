"use client";

import { useEffect, useState } from "react";
import { tuning } from "@/lib/tuning";
import styles from "./Header.module.css";

export function RotatingText({ items }: { items: string[] }) {
  const [index, setIndex] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (items.length < 2) return;
    let timer: ReturnType<typeof setTimeout>;
    const fade = () => {
      setHidden(true);
      timer = setTimeout(() => {
        setIndex((current) => (current + 1) % items.length);
        setHidden(false);
        timer = setTimeout(fade, tuning.header.showMs);
      }, tuning.header.fadeMs);
    };
    timer = setTimeout(fade, tuning.header.showMs + tuning.header.fadeMs);
    return () => clearTimeout(timer);
  }, [items.length]);

  return (
    <span className={hidden ? `${styles.rotating} ${styles.hidden}` : styles.rotating}>{items[index]}</span>
  );
}
