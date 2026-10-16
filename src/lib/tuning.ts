export const defaults = {
  sparks: { cursorRadius: 80, push: 5200, spring: 38, damping: 8.5, burst: 1500 },
  sparkLook: {
    size: [6, 14],
    speed: [14, 40],
    offset: 40,
    spread: 120,
    margin: 28,
    wobble: [8, 28],
    wobbleSpeed: [0.35, 0.95],
    glow: [0.45, 0.9],
    twinkle: [0.12, 0.37],
    twinkleSpeed: [0.6, 2],
    heatGrow: 0.7,
    heatGlow: 0.5,
    heatDecay: 3,
  },
  sparkLayout: { count: 22, trackSamples: 480, smoothing: 8, cropTouch: 2, cropHide: 100, cropFade: 180 },
  flip: { ms: 650, sharpness: 5 },
  peek: {
    delay: 3000,
    every: 12000,
    limit: 3,
    back: 34,
    backMs: 420,
    forth: 12,
    forthMs: 380,
    settleMs: 460,
  },
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
