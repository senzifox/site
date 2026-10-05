import { cached } from "@/lib/cache";
import { type Game, type SteamNow, steamIdle } from "./types";

type Summary = { gameid?: string; gameextrainfo?: string };

type Recent = { appid: number; name: string };

const API = "https://api.steampowered.com";
const STEAM_ID = /^\d{17}$/;
const TIMEOUT_MS = 3_000;

export const toGame = (appId: string | number, name: string): Game => ({
  name,
  appId: String(appId),
  imageUrl: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`,
  url: `https://store.steampowered.com/app/${appId}`,
});

export const toSteamNow = (summary: Summary | undefined, recent: Recent | undefined): SteamNow => {
  if (summary?.gameid && summary.gameextrainfo) {
    return { isPlaying: true, game: toGame(summary.gameid, summary.gameextrainfo) };
  }
  return { isPlaying: false, recent: recent ? toGame(recent.appid, recent.name) : null };
};

class SteamError extends Error {
  constructor(what: string, response: Response) {
    super(`Steam ${what} request failed: ${response.status}`);
  }
}

const request = async <T>(what: string, path: string, params: Record<string, string>) => {
  const response = await fetch(`${API}/${path}?${new URLSearchParams(params)}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new SteamError(what, response);
  return (await response.json()) as T;
};

let resolved: string | null = null;

const steamId = async (key: string, id: string) => {
  if (STEAM_ID.test(id)) return id;
  if (resolved) return resolved;
  const { response } = await request<{ response: { success: number; steamid?: string } }>(
    "vanity",
    "ISteamUser/ResolveVanityURL/v1/",
    { key, vanityurl: id },
  );
  if (response.success !== 1 || !response.steamid) throw new Error(`Steam id "${id}" not found`);
  resolved = response.steamid;
  return resolved;
};

const loadSteamNow = async (): Promise<SteamNow> => {
  const { STEAM_API_KEY: key, STEAM_ID: id } = process.env;
  if (!key || !id) return steamIdle;

  const steamid = await steamId(key, id);
  const { response } = await request<{ response: { players: Summary[] } }>(
    "summary",
    "ISteamUser/GetPlayerSummaries/v2/",
    { key, steamids: steamid },
  );
  const summary = response.players[0];
  if (summary?.gameid && summary.gameextrainfo) return toSteamNow(summary, undefined);

  const recent = await request<{ response: { games?: Recent[] } }>(
    "recent",
    "IPlayerService/GetRecentlyPlayedGames/v1/",
    { key, steamid, count: "1" },
  );
  return toSteamNow(summary, recent.response.games?.[0]);
};

const loadCached = cached(loadSteamNow, { ttlMs: 30_000, errorTtlMs: 15_000 });

export const getSteamNow = async () => (await loadCached()).data;
