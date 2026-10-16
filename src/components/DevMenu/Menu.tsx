"use client";

import { button, folder, LevaPanel, monitor, useControls, useCreateStore } from "leva";
import { useEffect, useState } from "react";
import { clock, setClock, subscribeClock } from "@/lib/clock";
import { defaults, resetTuning, runAction, tuning, tuningStyle } from "@/lib/tuning";
import { type Category, categories, type Range, type Section } from "./categories";
import { COLORS, colorKey, paintColor, swatches, toHex } from "./colors";
import styles from "./Menu.module.css";
import { forget, restore, save } from "./storage";
import { theme } from "./theme";
import { FPS_INTERVAL, fps, measureFps, syncAnimations } from "./time";

type Store = ReturnType<typeof useCreateStore>;

type Schema = Parameters<typeof folder>[0];

type Value = number | number[];

const same = (a: Value, b: Value) =>
  Array.isArray(a) && Array.isArray(b) ? a.every((item, i) => item === b[i]) : a === b;

const copy = (value: Value) => (Array.isArray(value) ? [...value] : value);

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

function Colors({ store }: { store: Store }) {
  const schema = Object.fromEntries(
    swatches.map((swatch) => [
      colorKey(swatch),
      { label: swatch.label, value: toHex(swatch), onChange: (value: string) => paintColor(swatch, value) },
    ]),
  );
  useControls(COLORS, schema, { store });
  return null;
}

subscribeClock(syncAnimations);

const TOOLS = "время";
function Tools({ store }: { store: Store }) {
  useEffect(measureFps, []);
  useControls(
    TOOLS,
    {
      speed: {
        label: "скорость",
        value: clock.scale,
        min: 0,
        max: 2,
        step: 0.05,
        onChange: (scale: number) => setClock({ scale }),
      },
      paused: { label: "пауза", value: clock.paused, onChange: (paused: boolean) => setClock({ paused }) },
      fps: monitor(() => Math.round(fps.value), { interval: FPS_INTERVAL }),
      график: monitor(() => fps.value, { graph: true, interval: FPS_INTERVAL }),
    },
    { store },
  );
  return null;
}

const resetAll = (store: Store) => {
  resetTuning();
  forget();
  setClock({ scale: 1, paused: false });
  const paths: Record<string, Value | string | boolean> = {
    [`${TOOLS}.speed`]: 1,
    [`${TOOLS}.paused`]: false,
  };
  for (const swatch of swatches) {
    document.documentElement.style.removeProperty(swatch.name);
    paths[`${COLORS}.${colorKey(swatch)}`] = toHex(swatch);
  }
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
      <Tools store={store} />
      {categories.map((category) => (
        <Controls key={category.folder} store={store} category={category} />
      ))}
      <Colors store={store} />
      <MenuActions store={store} />
      {open && (
        <div className={styles.panel} data-dev-menu="">
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
        data-dev-menu=""
        aria-label={open ? "close dev menu" : "open dev menu"}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        dev
      </button>
    </>
  );
}
