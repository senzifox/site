import { HttpError } from "./http";

export type Fetched<T> = { data: T; fetchedAt: number };

type Options = { ttlMs: number; errorTtlMs: number; staleMs?: number; now?: () => number };

const retryAfterMs = (error: unknown) => (error instanceof HttpError ? error.retryAfterMs : undefined);

export const cached = <T>(
  load: () => Promise<T>,
  { ttlMs, errorTtlMs, staleMs = 0, now = Date.now }: Options,
) => {
  let value: Fetched<T> | null = null;
  let failure: { error: unknown; until: number } | null = null;
  let pending: Promise<Fetched<T>> | null = null;

  const stale = (time: number) => (value && time - value.fetchedAt < ttlMs + staleMs ? value : null);

  return async (): Promise<Fetched<T>> => {
    const time = now();
    if (value && time - value.fetchedAt < ttlMs) return value;
    if (failure && failure.until > time) {
      const fallback = stale(time);
      if (fallback) return fallback;
      throw failure.error;
    }
    if (pending) return pending;
    pending = load()
      .then(
        (data) => {
          value = { data, fetchedAt: now() };
          failure = null;
          return value;
        },
        (error: unknown) => {
          failure = { error, until: now() + (retryAfterMs(error) ?? errorTtlMs) };
          const fallback = stale(now());
          if (!fallback) throw error;
          console.error(error);
          return fallback;
        },
      )
      .finally(() => {
        pending = null;
      });
    return pending;
  };
};
