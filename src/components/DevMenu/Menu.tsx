"use client";

import { button, folder, LevaPanel, useControls, useCreateStore } from "leva";
import { useEffect, useState } from "react";
import { applyTuning, defaults, resetTuning, runAction, type Tuning, tuning } from "@/lib/tuning";
import styles from "./Menu.module.css";

type Store = ReturnType<typeof useCreateStore>;

type Schema = Parameters<typeof folder>[0];

type Range = { label: string; min: number; max: number; step: number };

type Section = { title: string; key: keyof Tuning; ranges: Record<string, Range> };

type Category = { folder: string; actions?: Record<string, string>; sections: Section[] };

const STORAGE_KEY = "dev:tuning";
const SAVE_DELAY = 200;

const categories: Category[] = [
  {
    folder: "искры",
    actions: { бахнуть: "sparks.burst" },
    sections: [
      {
        title: "физика",
        key: "sparks",
        ranges: {
          cursorRadius: { label: "радиус курсора", min: 0, max: 240, step: 1 },
          push: { label: "толчок", min: 0, max: 20000, step: 100 },
          spring: { label: "пружина", min: 1, max: 200, step: 1 },
          damping: { label: "затухание", min: 0, max: 40, step: 0.5 },
          burst: { label: "сила вспышки", min: 0, max: 5000, step: 50 },
        },
      },
      {
        title: "вид",
        key: "sparkLook",
        ranges: {
          size: { label: "размер", min: 1, max: 40, step: 0.5 },
          speed: { label: "скорость", min: 0, max: 200, step: 1 },
          offset: { label: "отступ", min: 0, max: 200, step: 1 },
          spread: { label: "разброс отступа", min: 0, max: 400, step: 1 },
          margin: { label: "не ближе к контуру", min: 0, max: 120, step: 1 },
          wobble: { label: "покачивание", min: 0, max: 80, step: 1 },
          wobbleSpeed: { label: "темп покачивания", min: 0, max: 4, step: 0.05 },
          glow: { label: "яркость", min: 0, max: 1, step: 0.01 },
          twinkle: { label: "мерцание", min: 0, max: 1, step: 0.01 },
          twinkleSpeed: { label: "темп мерцания", min: 0, max: 8, step: 0.05 },
          heatGrow: { label: "рост от курсора", min: 0, max: 3, step: 0.05 },
          heatGlow: { label: "свет от курсора", min: 0, max: 1, step: 0.01 },
          heatDecay: { label: "остывание", min: 0.1, max: 12, step: 0.1 },
        },
      },
    ],
  },
];

type Value = number | number[];

const same = (a: Value, b: Value) =>
  Array.isArray(a) && Array.isArray(b) ? a.every((item, i) => item === b[i]) : a === b;

const copy = (value: Value) => (Array.isArray(value) ? [...value] : value);

const theme = {
  colors: {
    elevation1: "#1a120d",
    elevation2: "#120c09",
    elevation3: "#2a1d15",
    accent1: "#e0956a",
    accent2: "#f2a36b",
    accent3: "#ffc49a",
    highlight1: "#a8a2b2",
    highlight2: "#e6e0e9",
    highlight3: "#f4f0f8",
    vivid1: "#f2a36b",
    folderWidgetColor: "#a8a2b2",
    folderTextColor: "#e6e0e9",
    toolTipBackground: "#f4f0f8",
    toolTipText: "#120c09",
  },
  fonts: {
    mono: "var(--font-mono), ui-monospace, monospace",
    sans: "var(--font-mono), ui-monospace, monospace",
  },
  radii: { xs: "4px", sm: "6px", lg: "10px" },
};

const restore = () => {
  try {
    applyTuning(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null"));
  } catch {
    return;
  }
};

let saveTimer: ReturnType<typeof setTimeout> | undefined;

const save = () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tuning));
    } catch {
      return;
    }
  }, SAVE_DELAY);
};

const forget = () => {
  clearTimeout(saveTimer);
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
};

restore();

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

const update = (values: Record<string, Value>, key: string, value: Value) => {
  if (same(values[key], value)) return;
  values[key] = copy(value);
  save();
};

const control = (values: Record<string, Value>, key: string, range: Range) => {
  const current = values[key];
  if (Array.isArray(current)) {
    return {
      ...range,
      value: [current[0], current[1]] as [number, number],
      onChange: (value: [number, number]) => update(values, key, value),
    };
  }
  return { ...range, value: current, onChange: (value: number) => update(values, key, value) };
};

const sliders = (section: Section): Schema => {
  const values = tuning[section.key] as Record<string, Value>;
  return Object.fromEntries(
    Object.entries(section.ranges).map(([key, range]) => [key, control(values, key, range)]),
  );
};

function Controls({ store, category }: { store: Store; category: Category }) {
  const buttons = Object.fromEntries(
    Object.entries(category.actions ?? {}).map(([label, action]) => [label, button(() => runAction(action))]),
  );
  const sections = Object.fromEntries(
    category.sections.map((section) => [section.title, folder(sliders(section))]),
  );
  useControls(category.folder, { ...buttons, ...sections }, { store });
  return null;
}

const resetAll = (store: Store) => {
  resetTuning();
  forget();
  const paths: Record<string, Value> = {};
  for (const category of categories) {
    for (const section of category.sections) {
      const values = defaults[section.key] as Record<string, Value>;
      for (const key of Object.keys(section.ranges)) {
        paths[`${category.folder}.${section.title}.${key}`] = copy(values[key]);
      }
    }
  }
  store.set(paths, false);
};

function MenuActions({ store }: { store: Store }) {
  useControls({ "сбросить всё": button(() => resetAll(store)) }, { store });
  return null;
}

export function Menu() {
  const store = useCreateStore();
  const [open, setOpen] = useState(false);

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
      {categories.map((category) => (
        <Controls key={category.folder} store={store} category={category} />
      ))}
      <MenuActions store={store} />
      {open && (
        <div className={styles.panel}>
          <LevaPanel
            store={store}
            fill
            theme={theme}
            titleBar={{ title: "dev", drag: false, filter: false }}
          />
        </div>
      )}
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
