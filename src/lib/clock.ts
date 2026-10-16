const listeners = new Set<() => void>();

export const clock = { scale: 1, paused: false };

export const timeScale = () => (clock.paused ? 0 : clock.scale);

export const setClock = (next: Partial<typeof clock>) => {
  Object.assign(clock, next);
  for (const listener of listeners) listener();
};

export const subscribeClock = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
