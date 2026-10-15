"use client";

import { button, LevaPanel, useControls, useCreateStore } from "leva";
import { useEffect, useState } from "react";
import { runAction, type Tuning, tuning } from "@/lib/tuning";
import styles from "./Menu.module.css";

type Range = { label: string; min: number; max: number; step: number };

const sparkRanges: Record<keyof Tuning["sparks"], Range> = {
  cursorRadius: { label: "радиус курсора", min: 0, max: 240, step: 1 },
  push: { label: "толчок", min: 0, max: 20000, step: 100 },
  spring: { label: "пружина", min: 1, max: 200, step: 1 },
  damping: { label: "затухание", min: 0, max: 40, step: 0.5 },
  burst: { label: "сила вспышки", min: 0, max: 5000, step: 50 },
};

const sliders = <K extends string>(values: Record<K, number>, ranges: Record<K, Range>) =>
  Object.fromEntries(
    (Object.keys(ranges) as K[]).map((key) => [
      key,
      {
        ...ranges[key],
        value: values[key],
        onChange: (value: number) => {
          values[key] = value;
        },
      },
    ]),
  );

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

export function Menu() {
  const store = useCreateStore();
  const [open, setOpen] = useState(false);

  useControls(
    "искры",
    { ...sliders(tuning.sparks, sparkRanges), бахнуть: button(() => runAction("sparks.burst")) },
    { store },
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "`" || isTyping(event.target)) return;
      event.preventDefault();
      setOpen((current) => !current);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className={styles.panel} hidden={!open}>
        <LevaPanel store={store} fill titleBar={{ title: "dev", drag: false, filter: false }} />
      </div>
      <button
        type="button"
        className={styles.toggle}
        aria-label={open ? "close dev menu" : "open dev menu"}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        dev
      </button>
    </>
  );
}
