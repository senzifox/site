import { cached, type Fetched } from "@/lib/cache";
import { fetchJson } from "@/lib/http";

export type GithubPush = { repo: string; at: string };

type Event = { type: string; repo: { name: string }; created_at: string };

export const latestPush = (events: Event[]): GithubPush | null => {
  const push = events.find((event) => event.type === "PushEvent");
  return push ? { repo: push.repo.name, at: push.created_at } : null;
};

const load = (user: string) => async () =>
  latestPush(
    await fetchJson<Event[]>(
      "GitHub events",
      `https://api.github.com/users/${encodeURIComponent(user)}/events/public?per_page=30`,
      { headers: { Accept: "application/vnd.github+json", "User-Agent": "senzi.dev" } },
    ),
  );

let loader: { user: string; get: () => Promise<Fetched<GithubPush | null>> } | null = null;

export const getGithubPush = async (user: string) => {
  if (loader?.user !== user)
    loader = { user, get: cached(load(user), { ttlMs: 600_000, errorTtlMs: 300_000, staleMs: 86_400_000 }) };
  return (await loader.get()).data;
};
