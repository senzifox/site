const TIMEOUT_MS = 3_000;

export class HttpError extends Error {
  readonly status: number;
  readonly retryAfterMs?: number;

  constructor(what: string, response: Response) {
    super(`${what} request failed: ${response.status}`);
    this.status = response.status;
    const retryAfter = Number(response.headers.get("retry-after"));
    if (response.status === 429 && retryAfter > 0) this.retryAfterMs = retryAfter * 1000;
  }
}

export const request = (url: string, init: RequestInit = {}) =>
  fetch(url, { cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS), ...init });

export const fetchJson = async <T>(what: string, url: string, init?: RequestInit) => {
  const response = await request(url, init);
  if (!response.ok) throw new HttpError(what, response);
  return (await response.json()) as T;
};
