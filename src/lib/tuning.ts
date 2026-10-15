export const defaults = {
  sparks: { cursorRadius: 80, push: 5200, spring: 38, damping: 8.5, burst: 1500 },
};

export type Tuning = typeof defaults;

export const tuning: Tuning = structuredClone(defaults);

const actions = new Map<string, () => void>();

export const registerAction = (name: string, run: () => void) => {
  actions.set(name, run);
  return () => {
    if (actions.get(name) === run) actions.delete(name);
  };
};

export const runAction = (name: string) => actions.get(name)?.();
