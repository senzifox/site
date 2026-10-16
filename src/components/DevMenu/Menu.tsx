"use client";

import { button, folder, LevaPanel, monitor, useControls, useCreateStore } from "leva";
import { useEffect, useState } from "react";
import { clock, setClock, subscribeClock } from "@/lib/clock";
import { applyTuning, defaults, resetTuning, runAction, tuning, tuningStyle } from "@/lib/tuning";
import { type Category, categories, controlKey, controlPath, type Range, type Section } from "./categories";
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

const CHANGES = "изменено";
const CHANGES_DELAY = 150;

const changeListeners = new Set<() => void>();

const announceChange = () => {
  for (const listener of changeListeners) listener();
};

const update = (section: Section, key: string, value: Value) => {
  const values = tuning[section.key] as Record<string, Value>;
  if (same(values[key], value)) return;
  values[key] = copy(value);
  save();
  paintStyle();
  if (section.apply) runAction(section.apply);
  announceChange();
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
    Object.entries(section.ranges).map(([key, range]) => [
      controlKey(section, key),
      control(section, key, range),
    ]),
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
      fps: monitor(() => String(Math.round(fps.value)), { interval: FPS_INTERVAL }),
      график: monitor(() => fps.value, { graph: true, interval: FPS_INTERVAL }),
    },
    { store },
  );
  return null;
}

const showTuning = (store: Store) => {
  const paths: Record<string, Value> = {};
  for (const category of categories) {
    for (const section of category.sections) {
      const values = tuning[section.key] as Record<string, Value>;
      for (const key of Object.keys(section.ranges))
        paths[controlPath(category, section, key)] = copy(values[key]);
    }
  }
  store.set(paths, false);
  applyAll();
  announceChange();
};

const loadTuning = (store: Store, values: unknown) => {
  resetTuning();
  applyTuning(values);
  save();
  showTuning(store);
};

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
  store.set(paths, false);
  showTuning(store);
};

const formatNumber = (value: number) => String(Number(value.toFixed(3))).replace(".", ",");

const formatValue = (value: Value) =>
  Array.isArray(value) ? value.map(formatNumber).join("–") : formatNumber(value);

const resetFields = (store: Store, category: Category, section: Section, keys: string[]) => {
  const values = defaults[section.key] as Record<string, Value>;
  const paths: Record<string, Value> = {};
  for (const key of keys) {
    update(section, key, values[key]);
    paths[controlPath(category, section, key)] = copy(values[key]);
  }
  store.set(paths, false);
};

const changedKeys = (section: Section) => {
  const current = tuning[section.key] as Record<string, Value>;
  const initial = defaults[section.key] as Record<string, Value>;
  return Object.keys(section.ranges).filter((key) => !same(current[key], initial[key]));
};

const changesSchema = (store: Store): Schema => {
  const schema: Schema = {};
  for (const category of categories) {
    for (const section of category.sections) {
      const keys = changedKeys(section);
      if (keys.length > 1) {
        schema[`↺ ${section.title}: весь раздел`] = button(() => resetFields(store, category, section, keys));
      }
      for (const key of keys) {
        const current = (tuning[section.key] as Record<string, Value>)[key];
        const initial = (defaults[section.key] as Record<string, Value>)[key];
        const label = `↺ ${section.title} · ${section.ranges[key].label}: ${formatValue(current)} → ${formatValue(initial)}`;
        schema[label] = button(() => resetFields(store, category, section, [key]));
      }
    }
  }
  return schema;
};

function Changes({ store }: { store: Store }) {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const listener = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setVersion((current) => current + 1), CHANGES_DELAY);
    };
    changeListeners.add(listener);
    return () => {
      clearTimeout(timer);
      changeListeners.delete(listener);
    };
  }, []);

  useControls(CHANGES, () => changesSchema(store), { store }, [version]);
  return null;
}

const WRITE_URL = "/api/dev/tuning";
const STATUS_INTERVAL = 250;

const writeStatus = { text: "—" };

const writeToCode = async () => {
  writeStatus.text = "пишу…";
  try {
    const response = await fetch(WRITE_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(tuning),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const { written } = (await response.json()) as { written: boolean };
    writeStatus.text = written ? "записано в tuningDefaults.ts" : "в коде уже так";
  } catch (error) {
    writeStatus.text = `не вышло: ${error instanceof Error ? error.message : String(error)}`;
  }
};

const PRESETS = "пресеты";
const PRESETS_URL = "/api/dev/presets";

let presets: Record<string, unknown> = {};

const requestPresets = async (init?: RequestInit, query = "") => {
  const response = await fetch(`${PRESETS_URL}${query}`, init);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  presets = (await response.json()) as Record<string, unknown>;
  return Object.keys(presets);
};

const failure = (error: unknown) => `не вышло: ${error instanceof Error ? error.message : String(error)}`;

function Presets({ store }: { store: Store }) {
  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    requestPresets().then(setNames, (error) => {
      writeStatus.text = failure(error);
    });
  }, []);

  const run = async (task: () => Promise<string[]>, done: string) => {
    try {
      setNames(await task());
      writeStatus.text = done;
    } catch (error) {
      writeStatus.text = failure(error);
    }
  };

  const typed = () => String(store.get(`${PRESETS}.название`) ?? "").trim();
  const picked = () => String(store.get(`${PRESETS}.пресет`) ?? "");

  useControls(
    PRESETS,
    () => ({
      название: { value: "" },
      сохранить: button(() => {
        const name = typed();
        if (!name) {
          writeStatus.text = "нужно название";
          return;
        }
        run(
          () =>
            requestPresets({
              method: "PUT",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ name, values: tuning }),
            }),
          `пресет «${name}» сохранён`,
        );
      }),
      ...(names.length > 0 && {
        пресет: { options: names, value: names[0] },
        загрузить: button(() => {
          const name = picked();
          if (!(name in presets)) return;
          loadTuning(store, presets[name]);
          writeStatus.text = `пресет «${name}» загружен`;
        }),
        удалить: button(() => {
          const name = picked();
          run(
            () => requestPresets({ method: "DELETE" }, `?name=${encodeURIComponent(name)}`),
            `пресет «${name}» удалён`,
          );
        }),
      }),
    }),
    { store },
    [names.join("\n")],
  );
  return null;
}

function MenuActions({ store }: { store: Store }) {
  useControls(
    {
      "записать в код": button(writeToCode),
      статус: monitor(() => writeStatus.text, { interval: STATUS_INTERVAL }),
      "сбросить всё": button(() => resetAll(store)),
    },
    { store },
  );
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
      <Changes store={store} />
      <Presets store={store} />
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
