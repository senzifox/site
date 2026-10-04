import { cached } from "@/lib/cache";
import { type NowSpotify, spotifyIdle } from "./types";

type Image = { url: string; width: number | null };

type CurrentlyPlaying = {
  is_playing: boolean;
  progress_ms: number | null;
  currently_playing_type: "track" | "episode" | "ad" | "unknown";
  item: {
    name: string;
    duration_ms: number;
    external_urls: { spotify?: string };
    album?: { images: Image[] };
    artists?: { name: string }[];
    images?: Image[];
    show?: { name: string; images: Image[] };
  } | null;
};

const COVER_TARGET_WIDTH = 240;
const TIMEOUT_MS = 3_000;
const TOKEN_URL = "https://accounts.spotify.com/api/token";
const PLAYER_URL = "https://api.spotify.com/v1/me/player/currently-playing?additional_types=track,episode";

export const pickImage = (images: Image[], target = COVER_TARGET_WIDTH) => {
  const sorted = [...images].sort((a, b) => (a.width ?? 0) - (b.width ?? 0));
  return (sorted.find((image) => (image.width ?? 0) >= target) ?? sorted.at(-1))?.url ?? "";
};

export const advance = (data: NowSpotify, elapsedMs: number): NowSpotify =>
  data.isPlaying
    ? { ...data, progressMs: Math.min(data.durationMs, data.progressMs + Math.max(0, elapsedMs)) }
    : data;

class SpotifyError extends Error {
  retryAfterMs?: number;

  constructor(what: string, response: Response) {
    super(`Spotify ${what} request failed: ${response.status}`);
    const retryAfter = Number(response.headers.get("retry-after"));
    if (response.status === 429 && retryAfter > 0) this.retryAfterMs = retryAfter * 1000;
  }
}

export const toNowSpotify = (payload: CurrentlyPlaying | null): NowSpotify => {
  const item = payload?.item;
  if (!payload?.is_playing || !item) return spotifyIdle;

  if (payload.currently_playing_type === "episode") {
    return {
      isPlaying: true,
      title: item.name,
      artist: item.show?.name ?? "",
      albumImageUrl: pickImage(item.images?.length ? item.images : (item.show?.images ?? [])),
      songUrl: item.external_urls.spotify ?? "",
      progressMs: payload.progress_ms ?? 0,
      durationMs: item.duration_ms,
    };
  }

  if (payload.currently_playing_type !== "track") return spotifyIdle;

  return {
    isPlaying: true,
    title: item.name,
    artist: (item.artists ?? []).map((artist) => artist.name).join(", "),
    albumImageUrl: pickImage(item.album?.images ?? []),
    songUrl: item.external_urls.spotify ?? "",
    progressMs: payload.progress_ms ?? 0,
    durationMs: item.duration_ms,
  };
};

type Credentials = { clientId: string; clientSecret: string; refreshToken: string };

const readCredentials = (): Credentials | null => {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) return null;
  return {
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
    refreshToken: SPOTIFY_REFRESH_TOKEN,
  };
};

let token: { value: string; expiresAt: number } | null = null;

const accessToken = async ({ clientId, clientSecret, refreshToken }: Credentials) => {
  if (token && token.expiresAt > Date.now()) return token.value;

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new SpotifyError("token", response);

  const data = (await response.json()) as { access_token: string; expires_in: number };
  token = { value: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return token.value;
};

const loadNowSpotify = async (): Promise<NowSpotify> => {
  const credentials = readCredentials();
  if (!credentials) return spotifyIdle;

  const request = async () =>
    fetch(PLAYER_URL, {
      headers: { Authorization: `Bearer ${await accessToken(credentials)}` },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

  let response = await request();
  if (response.status === 401) {
    token = null;
    response = await request();
  }
  if (response.status === 204) return spotifyIdle;
  if (!response.ok) throw new SpotifyError("player", response);

  return toNowSpotify((await response.json()) as CurrentlyPlaying);
};

const loadCached = cached(loadNowSpotify, { ttlMs: 10_000, errorTtlMs: 5_000 });

export const getNowSpotify = async () => {
  const { data, fetchedAt } = await loadCached();
  return advance(data, Date.now() - fetchedAt);
};
