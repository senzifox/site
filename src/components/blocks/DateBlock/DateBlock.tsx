"use client";

import { useEffect, useState } from "react";
import { LabeledCard } from "@/components/Card/Card";
import { ProgressLine } from "@/components/ProgressLine/ProgressLine";
import type { Lang, DateBlock as Props } from "@/content/types";
import {
  type Duration,
  dateState,
  formatInDays,
  formatLongDate,
  formatPercent,
  type PluralForms,
  parseMoment,
  plural,
  splitDuration,
} from "@/lib/countdown";
import styles from "./DateBlock.module.css";

const UNITS: Record<Lang, Record<keyof Duration, PluralForms>> = {
  ru: {
    days: { one: "день", few: "дня", other: "дней" },
    hours: { one: "час", few: "часа", other: "часов" },
    minutes: { one: "минута", few: "минуты", other: "минут" },
    seconds: { one: "секунда", few: "секунды", other: "секунд" },
  },
  en: {
    days: { one: "day", other: "days" },
    hours: { one: "hour", other: "hours" },
    minutes: { one: "minute", other: "minutes" },
    seconds: { one: "second", other: "seconds" },
  },
};

const UNIT_ORDER = ["days", "hours", "minutes", "seconds"] as const satisfies readonly (keyof Duration)[];

type LookProps = { duration: Duration | null; lang: Lang };

const pad = (value: number) => String(value).padStart(2, "0");

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

function Tiles({ duration, lang }: LookProps) {
  return (
    <span className={styles.tiles}>
      {UNIT_ORDER.map((key) => {
        const value = duration?.[key];
        return (
          <span key={key} className={styles.tile}>
            <span className={styles.value}>
              {value === undefined ? "--" : String(value).padStart(key === "days" ? 1 : 2, "0")}
            </span>
            <span className={styles.unit}>{plural(value ?? 0, UNITS[lang][key], lang)}</span>
          </span>
        );
      })}
    </span>
  );
}

function Big({ duration, lang }: LookProps) {
  const colon = <span className={styles.colon}>:</span>;

  return (
    <span className={styles.big}>
      <span className={styles.days}>{duration?.days ?? "--"}</span>
      <span className={styles.rest}>
        <span className={styles.daysUnit}>{plural(duration?.days ?? 0, UNITS[lang].days, lang)}</span>
        <span className={styles.hms}>
          {duration ? pad(duration.hours) : "--"}
          {colon}
          {duration ? pad(duration.minutes) : "--"}
          {colon}
          {duration ? pad(duration.seconds) : "--"}
        </span>
      </span>
    </span>
  );
}

const LOOKS = { tiles: Tiles, big: Big } as const;

export function DateBlock({
  label,
  date,
  timeZone,
  mode = "countdown",
  look = "tiles",
  progress,
  hint,
  doneText,
  lang,
}: Props & { lang: Lang }) {
  const now = useNow(mode === "date" ? 60_000 : 1_000);

  if (!parseMoment(date)) return null;

  const state = now === null ? null : dateState(date, timeZone, mode, now);
  const bar = progress && state?.progress && !state.done ? state.progress : null;
  const barText =
    bar && progress?.replaceAll("{year}", String(bar.year)).replaceAll("{percent}", formatPercent(bar.value));
  const celebrating = state?.done && doneText?.trim();
  const Look = LOOKS[look];

  return (
    <LabeledCard label={label}>
      {celebrating ? (
        <p className={styles.done}>{celebrating}</p>
      ) : mode === "date" ? (
        <span className={styles.dateRow}>
          <time className={styles.date}>{state ? formatLongDate(timeZone, state.target, lang) : "--"}</time>
          {state && now !== null && (
            <span className={styles.caption}>{formatInDays(state.target, now, lang)}</span>
          )}
        </span>
      ) : (
        <Look duration={state ? splitDuration(state.ms) : null} lang={lang} />
      )}

      {bar && (
        <ProgressLine value={bar.value}>
          <span className={styles.caption}>{barText}</span>
        </ProgressLine>
      )}

      {hint?.trim() && <span className={styles.caption}>{hint}</span>}
    </LabeledCard>
  );
}
