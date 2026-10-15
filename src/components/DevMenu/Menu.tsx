"use client";

import { button, LevaPanel, useControls, useCreateStore } from "leva";
import { useEffect, useState } from "react";
import { applyTuning, defaults, resetTuning, runAction, type Tuning, tuning } from "@/lib/tuning";
import styles from "./Menu.module.css";

type Store = ReturnType<typeof useCreateStore>;

type Range = { label: string; min: number; max: number; step: number };

type Group = {
  folder: string;
  key: keyof Tuning;
  ranges: Record<string, Range>;
  actions?: Record<string, string>;
};

const STORAGE_KEY = "dev:tuning";
const SAVE_DELAY = 200;

const groups: Group[] = [
  {
    folder: "искры",
    key: "sparks",
    ranges: {
      cursorRadius: { label: "радиус курсора", min: 0, max: 240, step: 1 },
      push: { label: "толчок", min: 0, max: 20000, step: 100 },
      spring: { label: "пружина", min: 1, max: 200, step: 1 },
      damping: { label: "затухание", min: 0, max: 40, step: 0.5 },
      burst: { label: "сила вспышки", min: 0, max: 5000, step: 50 },
    },
    actions: { бахнуть: "sparks.burst" },
  },
];

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

function Controls({ store, group }: { store: Store; group: Group }) {
  const values = tuning[group.key] as Record<string, number>;
  const sliders = Object.fromEntries(
    Object.entries(group.ranges).map(([key, range]) => [
      key,
      {
        ...range,
        value: values[key],
        onChange: (value: number) => {
          if (values[key] === value) return;
          values[key] = value;
          save();
        },
      },
    ]),
  );
  const buttons = Object.fromEntries(
    Object.entries(group.actions ?? {}).map(([label, action]) => [label, button(() => runAction(action))]),
  );
  useControls(group.folder, { ...sliders, ...buttons }, { store });
  return null;
}

const resetAll = (store: Store) => {
  resetTuning();
  forget();
  const paths: Record<string, number> = {};
  for (const group of groups) {
    const values = defaults[group.key] as Record<string, number>;
    for (const key of Object.keys(group.ranges)) paths[`${group.folder}.${key}`] = values[key];
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
      {groups.map((group) => (
        <Controls key={group.key} store={store} group={group} />
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
