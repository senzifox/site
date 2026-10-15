export const defaults = {
  sparks: { cursorRadius: 80, push: 5200, spring: 38, damping: 8.5, burst: 1500 },
};

export type Tuning = typeof defaults;

export const tuning: Tuning = structuredClone(defaults);

type Bag = Record<string, unknown>;

const isBag = (value: unknown): value is Bag => typeof value === "object" && value !== null;

const assign = (target: Bag, source: unknown) => {
  if (!isBag(source)) return;
  for (const [key, current] of Object.entries(target)) {
    const next = source[key];
    if (isBag(current)) assign(current, next);
    else if (typeof next === typeof current) target[key] = next;
  }
};

export const applyTuning = (source: unknown) => assign(tuning, source);

export const resetTuning = () => assign(tuning, defaults);

const actions = new Map<string, () => void>();

export const registerAction = (name: string, run: () => void) => {
  actions.set(name, run);
  return () => {
    if (actions.get(name) === run) actions.delete(name);
  };
};

export const runAction = (name: string) => actions.get(name)?.();
