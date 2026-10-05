import { type TerminalVariant, terminal } from "@/content/terminal";
import type { TerminalRow } from "@/content/types";
import { getGithubPush } from "@/lib/github/github";
import { getSpotifyNow } from "@/lib/spotify/spotify";
import { spotifyIdle } from "@/lib/spotify/types";
import { getSteamNow } from "@/lib/steam/steam";
import { steamIdle } from "@/lib/steam/types";
import { renderTerminal } from "@/lib/terminal/render";

export const dynamic = "force-dynamic";

const headers = {
  "content-type": "text/plain; charset=utf-8",
  "cache-control": "no-store",
  "x-robots-tag": "noindex",
};

const BUDGET_MS = 3_000;

const within = async <T>(promise: Promise<T>, fallback: T) => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const late = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), BUDGET_MS);
  });
  const settled = promise.catch((error: unknown) => {
    console.error(error);
    return fallback;
  });
  try {
    return await Promise.race([settled, late]);
  } finally {
    clearTimeout(timer);
  }
};

const isVariant = (value: string): value is TerminalVariant => Object.hasOwn(terminal, value);

export async function GET(_request: Request, { params }: { params: Promise<{ variant: string }> }) {
  const { variant } = await params;
  if (!isVariant(variant)) return new Response("not found\n", { status: 404, headers });

  const rows = terminal[variant];
  const uses = (type: TerminalRow["type"]) => rows.some((row) => row.type === type);
  const [user] = rows.flatMap((row) => (row.type === "github" ? [row.user] : []));
  const [spotify, steam, github] = await Promise.all([
    uses("spotify") ? within(getSpotifyNow(), spotifyIdle) : spotifyIdle,
    uses("steam") ? within(getSteamNow(), steamIdle) : steamIdle,
    user ? within(getGithubPush(user), null) : null,
  ]);

  const body = renderTerminal(rows, {
    spotify,
    steam,
    github,
    uptime: process.uptime(),
    deploy: { sha: process.env.BUILD_SHA ?? "dev", time: process.env.BUILD_TIME ?? new Date().toISOString() },
    now: new Date(),
  });
  return new Response(body, { headers });
}
