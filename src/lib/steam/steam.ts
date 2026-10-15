import { profile } from "@/content/profile";
import { cached } from "@/lib/cache";
import { fetchJson } from "@/lib/http";
import { type Game, type SteamNow, steamIdle } from "./types";

type Summary = { gameid?: string; gameextrainfo?: string };

type Recent = { appid: number; name: string };

type Owned = { appid: number; rtime_last_played?: number };

const API = "https://api.steampowered.com";
const STEAM_ID = /^\d{17}$/;

export const toGame = (appId: string | number, name: string): Game => ({
  name,
  imageUrl: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`,
  url: `https://store.steampowered.com/app/${appId}`,
});

export const toSteamNow = (summary: Summary | undefined, recent: Recent | undefined): SteamNow => {
  if (summary?.gameid && summary.gameextrainfo) {
    return { isPlaying: true, game: toGame(summary.gameid, summary.gameextrainfo) };
  }
  return { isPlaying: false, recent: recent ? toGame(recent.appid, recent.name) : null };
};

export const pickRecent = (recent: Recent[], lastPlayed: Map<number, number>, hidden: readonly string[]) =>
  recent
    .filter(({ name }) => !hidden.includes(name))
    .map((game, order) => ({ game, order, time: lastPlayed.get(game.appid) ?? 0 }))
    .sort((a, b) => b.time - a.time || a.order - b.order)[0]?.game;

const request = <T>(what: string, path: string, params: Record<string, string>) =>
  fetchJson<T>(`Steam ${what}`, `${API}/${path}?${new URLSearchParams(params)}`);

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

const loadLastPlayed = async (key: string, steamid: string, games: Recent[]) => {
  if (games.length === 0) return new Map<number, number>();
  const filter = Object.fromEntries(games.map(({ appid }, i) => [`appids_filter[${i}]`, String(appid)]));
  const { response } = await request<{ response: { games?: Owned[] } }>(
    "owned",
    "IPlayerService/GetOwnedGames/v1/",
    { key, steamid, include_played_free_games: "1", ...filter },
  );
  return new Map(
    (response.games ?? []).map(({ appid, rtime_last_played }) => [appid, rtime_last_played ?? 0]),
  );
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
  const hidden = profile.steamHidden;
  const player = response.players[0];
  const summary = player?.gameextrainfo && hidden.includes(player.gameextrainfo) ? undefined : player;
  if (summary?.gameid && summary.gameextrainfo) return toSteamNow(summary, undefined);

  const recent = await request<{ response: { games?: Recent[] } }>(
    "recent",
    "IPlayerService/GetRecentlyPlayedGames/v1/",
    { key, steamid },
  );
  const games = recent.response.games ?? [];
  const lastPlayed = await loadLastPlayed(key, steamid, games).catch((error: unknown) => {
    console.error(error);
    return new Map<number, number>();
  });
  return toSteamNow(summary, pickRecent(games, lastPlayed, hidden));
};

const loadCached = cached(loadSteamNow, { ttlMs: 30_000, errorTtlMs: 15_000, staleMs: 300_000 });

export const getSteamNow = async () => (await loadCached()).data;
