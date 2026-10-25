"use client";

import { useEffect, useState } from "react";
import { LabeledCard } from "@/components/Card/Card";
import type { DateBlock as Props } from "@/content/types";
import {
  type Duration,
  dateState,
  formatInDays,
  formatLongDate,
  formatPercent,
  parseMoment,
  plural,
  splitDuration,
} from "@/lib/countdown";
import styles from "./DateBlock.module.css";

const UNITS = [
  ["days", ["день", "дня", "дней"]],
  ["hours", ["час", "часа", "часов"]],
  ["minutes", ["минута", "минуты", "минут"]],
  ["seconds", ["секунда", "секунды", "секунд"]],
] as const satisfies readonly (readonly [keyof Duration, readonly [string, string, string]])[];

function useNow(stepMs: number) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    let id: ReturnType<typeof setTimeout>;
    const tick = () => {
      const time = Date.now();
      setNow(time);
      id = setTimeout(tick, stepMs - (time % stepMs));
    };
    tick();
    return () => clearTimeout(id);
  }, [stepMs]);

  return now;
}

function Tiles({ duration }: { duration: Duration | null }) {
  return (
    <span className={styles.tiles}>
      {UNITS.map(([key, forms]) => {
        const value = duration?.[key];
        return (
          <span key={key} className={styles.tile}>
            <span className={styles.value}>
              {value === undefined ? "--" : String(value).padStart(key === "days" ? 1 : 2, "0")}
            </span>
            <span className={styles.unit}>{plural(value ?? 0, forms)}</span>
          </span>
        );
      })}
    </span>
  );
}

export function DateBlock({ label, date, timeZone, mode = "countdown", progress, hint, doneText }: Props) {
  const now = useNow(mode === "date" ? 60_000 : 1_000);

  if (!parseMoment(date)) return null;

  const state = now === null ? null : dateState(date, timeZone, mode, now);
  const bar = progress && state?.progress && !state.done ? state.progress : null;
  const barText =
    bar && progress?.replaceAll("{year}", String(bar.year)).replaceAll("{percent}", formatPercent(bar.value));
  const celebrating = state?.done && doneText?.trim();

  return (
    <LabeledCard label={label}>
      {celebrating ? (
        <p className={styles.done}>{celebrating}</p>
      ) : mode === "date" ? (
        <span className={styles.dateRow}>
          <time className={styles.date}>{state ? formatLongDate(timeZone, state.target) : "--"}</time>
          {state && now !== null && <span className={styles.caption}>{formatInDays(state.target, now)}</span>}
        </span>
      ) : (
        <Tiles duration={state ? splitDuration(state.ms) : null} />
      )}

      {bar && (
        <span className={styles.progress}>
          <span className={styles.track}>
            <span className={styles.fill} style={{ width: formatPercent(bar.value) }} />
          </span>
          <span className={styles.caption}>{barText}</span>
        </span>
      )}

      {hint?.trim() && <span className={styles.caption}>{hint}</span>}
    </LabeledCard>
  );
}
