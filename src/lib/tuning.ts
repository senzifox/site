import { defaults } from "./tuningDefaults";

export { defaults };

export type Tuning = typeof defaults;

export const tuning: Tuning = structuredClone(defaults);

export const tuningStyle = ({
  flashlight,
  cardGlow,
  header,
}: Tuning = tuning): Record<`--${string}`, string> => ({
  "--spot-strength": `${flashlight.strength}`,
  "--spot-falloff": `${flashlight.falloff}`,
  "--spot-falloff-at": `${flashlight.falloffAt}%`,
  "--card-ring-size": `${cardGlow.ring}px`,
  "--card-ring-strength": `${cardGlow.ringStrength * 100}%`,
  "--card-fill-size": `${cardGlow.fill}px`,
  "--card-fill-strength": `${cardGlow.fillStrength}`,
  "--rotate-fade": `${header.fadeMs}ms`,
});

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

export const mergeTuning = (source: unknown): Tuning => {
  const merged = structuredClone(defaults);
  assign(merged, source);
  return merged;
};

export const resetTuning = () => assign(tuning, defaults);

const actions = new Map<string, () => void>();

export const registerAction = (name: string, run: () => void) => {
  actions.set(name, run);
  return () => {
    if (actions.get(name) === run) actions.delete(name);
  };
};

export const runAction = (name: string) => actions.get(name)?.();
