"use client";

import { button, folder, LevaPanel, useControls, useCreateStore } from "leva";
import { useEffect, useState } from "react";
import {
  applyTuning,
  defaults,
  resetTuning,
  runAction,
  type Tuning,
  tuning,
  tuningStyle,
} from "@/lib/tuning";
import styles from "./Menu.module.css";

type Store = ReturnType<typeof useCreateStore>;

type Schema = Parameters<typeof folder>[0];

type Range = { label: string; min: number; max: number; step: number };

type Section = { title: string; key: keyof Tuning; apply?: string; ranges: Record<string, Range> };

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
      {
        title: "раскладка",
        key: "sparkLayout",
        apply: "sparks.layout",
        ranges: {
          count: { label: "количество", min: 1, max: 80, step: 1 },
          trackSamples: { label: "точек контура", min: 60, max: 1500, step: 10 },
          smoothing: { label: "сглаживание", min: 1, max: 40, step: 1 },
          cropTouch: { label: "касание края", min: 0, max: 40, step: 1 },
          cropHide: { label: "скрыть у края", min: 0, max: 400, step: 5 },
          cropFade: { label: "затухание у края", min: 1, max: 600, step: 5 },
        },
      },
    ],
  },
  {
    folder: "аватарка",
    actions: { перевернуть: "avatar.flip", покачать: "avatar.peek", "сбросить «уже листал»": "avatar.unsee" },
    sections: [
      {
        title: "переворот",
        key: "flip",
        ranges: {
          ms: { label: "длительность, мс", min: 0, max: 2000, step: 10 },
          sharpness: { label: "резкость торможения", min: 1, max: 10, step: 0.5 },
        },
      },
      {
        title: "подсказка",
        key: "peek",
        ranges: {
          delay: { label: "первая через, мс", min: 0, max: 15000, step: 100 },
          every: { label: "повтор через, мс", min: 1000, max: 60000, step: 500 },
          limit: { label: "сколько раз", min: 0, max: 10, step: 1 },
          back: { label: "угол назад", min: 0, max: 90, step: 1 },
          backMs: { label: "назад, мс", min: 0, max: 1500, step: 10 },
          forth: { label: "угол вперёд", min: 0, max: 90, step: 1 },
          forthMs: { label: "вперёд, мс", min: 0, max: 1500, step: 10 },
          settleMs: { label: "возврат, мс", min: 0, max: 1500, step: 10 },
        },
      },
    ],
  },
  {
    folder: "эффекты",
    actions: { "вспышка копирования": "copy.burst" },
    sections: [
      {
        title: "фонарик",
        key: "flashlight",
        ranges: {
          size: { label: "размер", min: 40, max: 1000, step: 10 },
          strength: { label: "яркость", min: 0, max: 1, step: 0.01 },
          falloff: { label: "яркость к краю", min: 0, max: 1, step: 0.01 },
          falloffAt: { label: "где край, %", min: 1, max: 99, step: 1 },
        },
      },
      {
        title: "подсветка карточек",
        key: "cardGlow",
        ranges: {
          ring: { label: "радиус рамки", min: 0, max: 600, step: 5 },
          ringStrength: { label: "яркость рамки", min: 0, max: 1, step: 0.01 },
          fill: { label: "радиус пятна", min: 0, max: 800, step: 5 },
          fillStrength: { label: "яркость пятна", min: 0, max: 0.5, step: 0.005 },
        },
      },
      {
        title: "вспышка копирования",
        key: "copyBurst",
        ranges: {
          count: { label: "количество", min: 1, max: 60, step: 1 },
          distance: { label: "дальность", min: 0, max: 200, step: 1 },
          duration: { label: "длительность, мс", min: 100, max: 3000, step: 10 },
          size: { label: "размер", min: 0.5, max: 12, step: 0.5 },
          drop: { label: "падение", min: -60, max: 80, step: 1 },
        },
      },
      {
        title: "фон",
        key: "background",
        apply: "background.repaint",
        ranges: {
          glow: { label: "свечение", min: 0, max: 2, step: 0.01 },
          parallax: { label: "параллакс точек", min: 0, max: 1, step: 0.01 },
        },
      },
    ],
  },
  {
    folder: "шапка и футер",
    sections: [
      {
        title: "сменяемая строка",
        key: "header",
        ranges: {
          showMs: { label: "показ, мс", min: 500, max: 15000, step: 100 },
          fadeMs: { label: "смена, мс", min: 0, max: 3000, step: 50 },
        },
      },
      {
        title: "хвост",
        key: "tail",
        apply: "tail.tempo",
        ranges: {
          seconds: { label: "цикл, с", min: 0.5, max: 12, step: 0.1 },
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

const paintStyle = () => {
  for (const [name, value] of Object.entries(tuningStyle()))
    document.documentElement.style.setProperty(name, value);
};

const applyAll = () => {
  paintStyle();
  for (const category of categories) {
    for (const { apply } of category.sections) if (apply) runAction(apply);
  }
};

restore();
applyAll();

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

const update = (section: Section, key: string, value: Value) => {
  const values = tuning[section.key] as Record<string, Value>;
  if (same(values[key], value)) return;
  values[key] = copy(value);
  save();
  paintStyle();
  if (section.apply) runAction(section.apply);
};

const control = (section: Section, key: string, range: Range) => {
  const current = (tuning[section.key] as Record<string, Value>)[key];
  if (Array.isArray(current)) {
    return {
      ...range,
      value: [current[0], current[1]] as [number, number],
      onChange: (value: [number, number]) => update(section, key, value),
    };
  }
  return { ...range, value: current, onChange: (value: number) => update(section, key, value) };
};

const sliders = (section: Section): Schema =>
  Object.fromEntries(
    Object.entries(section.ranges).map(([key, range]) => [key, control(section, key, range)]),
  );

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
  applyAll();
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
