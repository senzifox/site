import { cached } from "@/lib/cache";
import { fetchJson, HttpError, request } from "@/lib/http";
import { advance, type SpotifyNow, spotifyIdle } from "./types";

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
const TOKEN_URL = "https://accounts.spotify.com/api/token";
const PLAYER_URL = "https://api.spotify.com/v1/me/player/currently-playing?additional_types=track,episode";

export const pickImage = (images: Image[], target = COVER_TARGET_WIDTH) => {
  const sorted = [...images].sort((a, b) => (a.width ?? 0) - (b.width ?? 0));
  return (sorted.find((image) => (image.width ?? 0) >= target) ?? sorted.at(-1))?.url ?? "";
};

export const toSpotifyNow = (payload: CurrentlyPlaying | null): SpotifyNow => {
  const item = payload?.item;
  if (!payload?.is_playing || !item) return spotifyIdle;

  if (payload.currently_playing_type === "episode") {
    return {
      isPlaying: true,
      title: item.name,
      artists: item.show?.name ? [item.show.name] : [],
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
    artists: (item.artists ?? []).map((artist) => artist.name),
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

  const data = await fetchJson<{ access_token: string; expires_in: number }>("Spotify token", TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
  });
  token = { value: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return token.value;
};

const loadSpotifyNow = async (): Promise<SpotifyNow> => {
  const credentials = readCredentials();
  if (!credentials) return spotifyIdle;

  const player = async () =>
    request(PLAYER_URL, { headers: { Authorization: `Bearer ${await accessToken(credentials)}` } });

  let response = await player();
  if (response.status === 401) {
    token = null;
    response = await player();
  }
  if (response.status === 204) return spotifyIdle;
  if (!response.ok) throw new HttpError("Spotify player", response);

  return toSpotifyNow((await response.json()) as CurrentlyPlaying);
};

const loadCached = cached(loadSpotifyNow, { ttlMs: 10_000, errorTtlMs: 5_000, staleMs: 60_000 });

export const getSpotifyNow = async () => {
  const { data, fetchedAt } = await loadCached();
  return advance(data, Date.now() - fetchedAt);
};
