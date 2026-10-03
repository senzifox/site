export type Fetched<T> = { data: T; fetchedAt: number };

type Options = { ttlMs: number; errorTtlMs: number; now?: () => number };

export const retryAfterMs = (error: unknown) =>
  error instanceof Error && "retryAfterMs" in error && typeof error.retryAfterMs === "number"
    ? error.retryAfterMs
    : undefined;

export const cached = <T>(load: () => Promise<T>, { ttlMs, errorTtlMs, now = Date.now }: Options) => {
  let value: Fetched<T> | null = null;
  let failure: { error: unknown; until: number } | null = null;
  let pending: Promise<Fetched<T>> | null = null;

  return async (): Promise<Fetched<T>> => {
    const time = now();
    if (value && time - value.fetchedAt < ttlMs) return value;
    if (failure && failure.until > time) throw failure.error;
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
          throw error;
        },
      )
      .finally(() => {
        pending = null;
      });
    return pending;
  };
};
