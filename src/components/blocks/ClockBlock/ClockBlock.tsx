"use client";

import { useEffect, useId, useState } from "react";
import { Card } from "@/components/Card/Card";
import type { ClockBlock as Props } from "@/content/types";
import styles from "./ClockBlock.module.css";

const format = (timeZone: string) => {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
  } catch {
    return "";
  }
};

export function ClockBlock({ label, timeZone }: Props) {
  const labelId = useId();
  const heading = label?.trim();
  const [time, setTime] = useState(() => format(timeZone));

  useEffect(() => {
    const tick = () => setTime(format(timeZone));
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, [timeZone]);

  return (
    <Card className={styles.card} aria-labelledby={heading ? labelId : undefined}>
      {heading && (
        <span id={labelId} className={styles.label}>
          {heading}
        </span>
      )}
      <time className={styles.time} suppressHydrationWarning>
        {time}
      </time>
    </Card>
  );
}
