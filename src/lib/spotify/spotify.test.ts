import { describe, expect, it } from "vitest";
import { pickImage, toSpotifyNow } from "./spotify";
import { advance } from "./types";

const images = [
  { url: "640", width: 640 },
  { url: "300", width: 300 },
  { url: "64", width: 64 },
];

describe("pickImage", () => {
  it("picks the smallest image that covers the target", () => {
    expect(pickImage(images)).toBe("300");
    expect(pickImage(images, 500)).toBe("640");
  });

  it("falls back to the largest image", () => {
    expect(pickImage(images, 2000)).toBe("640");
  });

  it("returns empty string without images", () => {
    expect(pickImage([])).toBe("");
  });
});

describe("toSpotifyNow", () => {
  const track = {
    is_playing: true,
    progress_ms: 42_000,
    currently_playing_type: "track" as const,
    item: {
      name: "Song",
      duration_ms: 180_000,
      external_urls: { spotify: "https://open.spotify.com/track/1" },
      album: { images },
      artists: [{ name: "A" }, { name: "B" }],
    },
  };

  it("maps a playing track", () => {
    expect(toSpotifyNow(track)).toEqual({
      isPlaying: true,
      title: "Song",
      artists: ["A", "B"],
      albumImageUrl: "300",
      songUrl: "https://open.spotify.com/track/1",
      progressMs: 42_000,
      durationMs: 180_000,
    });
  });

  it("maps a playing episode", () => {
    const episode = {
      ...track,
      currently_playing_type: "episode" as const,
      item: {
        name: "Episode",
        duration_ms: 3_600_000,
        external_urls: {},
        images,
        show: { name: "Podcast", images: [] },
      },
    };
    expect(toSpotifyNow(episode)).toMatchObject({ isPlaying: true, title: "Episode", artists: ["Podcast"] });
  });

  it("falls back to show artwork when the episode has none", () => {
    const episode = {
      ...track,
      currently_playing_type: "episode" as const,
      item: {
        name: "Episode",
        duration_ms: 1_000,
        external_urls: {},
        images: [],
        show: { name: "Podcast", images: [{ url: "show", width: 300 }] },
      },
    };
    expect(toSpotifyNow(episode)).toMatchObject({ albumImageUrl: "show", songUrl: "" });
  });

  it("is idle when paused, empty, or an ad", () => {
    expect(toSpotifyNow(null)).toEqual({ isPlaying: false });
    expect(toSpotifyNow({ ...track, is_playing: false })).toEqual({ isPlaying: false });
    expect(toSpotifyNow({ ...track, item: null })).toEqual({ isPlaying: false });
    expect(toSpotifyNow({ ...track, currently_playing_type: "ad" })).toEqual({ isPlaying: false });
  });
});

describe("advance", () => {
  const playing = {
    isPlaying: true as const,
    title: "Song",
    artists: ["A"],
    albumImageUrl: "",
    songUrl: "",
    progressMs: 60_000,
    durationMs: 90_000,
  };

  it("moves progress forward by the elapsed time", () => {
    expect(advance(playing, 9_000)).toMatchObject({ progressMs: 69_000 });
  });

  it("stops at the end of the track", () => {
    expect(advance(playing, 60_000)).toMatchObject({ progressMs: 90_000 });
  });

  it("ignores negative elapsed time and idle state", () => {
    expect(advance(playing, -5_000)).toMatchObject({ progressMs: 60_000 });
    expect(advance({ isPlaying: false }, 9_000)).toEqual({ isPlaying: false });
  });
});
