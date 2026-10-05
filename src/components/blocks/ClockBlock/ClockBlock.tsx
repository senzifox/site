"use client";

import { useEffect, useState } from "react";
import { LabeledCard } from "@/components/Card/Card";
import type { ClockBlock as Props } from "@/content/types";
import { formatClock } from "@/lib/format";
import styles from "./ClockBlock.module.css";

const TICK_MS = 10_000;

export function ClockBlock({ label, timeZone }: Props) {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    const tick = () => setTime(formatClock(timeZone) || "--:--");
    tick();
    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, [timeZone]);

  return (
    <LabeledCard label={label}>
      <time className={styles.time}>{time}</time>
    </LabeledCard>
  );
}
