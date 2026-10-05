import { cached, type Fetched } from "@/lib/cache";

export type GithubPush = { repo: string; url: string; at: string };

const TIMEOUT_MS = 3_000;

type Event = { type: string; repo: { name: string }; created_at: string };

export const latestPush = (events: Event[]): GithubPush | null => {
  const push = events.find((event) => event.type === "PushEvent");
  return push
    ? { repo: push.repo.name, url: `https://github.com/${push.repo.name}`, at: push.created_at }
    : null;
};

const load = (user: string) => async () => {
  const response = await fetch(
    `https://api.github.com/users/${encodeURIComponent(user)}/events/public?per_page=30`,
    {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "senzi.dev" },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    },
  );
  if (!response.ok) throw new Error(`GitHub events request failed: ${response.status}`);
  return latestPush((await response.json()) as Event[]);
};

let loader: { user: string; get: () => Promise<Fetched<GithubPush | null>> } | null = null;

export const getGithubPush = async (user: string) => {
  if (loader?.user !== user)
    loader = { user, get: cached(load(user), { ttlMs: 600_000, errorTtlMs: 300_000 }) };
  return (await loader.get()).data;
};
