import { describe, expect, it } from "vitest";
import { pickRecent, toGame, toSteamNow } from "./steam";

describe("toSteamNow", () => {
  it("maps the game being played", () => {
    expect(toSteamNow({ gameid: "570", gameextrainfo: "Dota 2" }, undefined)).toEqual({
      isPlaying: true,
      game: toGame("570", "Dota 2"),
    });
  });

  it("falls back to the most recent game", () => {
    expect(toSteamNow({}, { appid: 730, name: "Counter-Strike 2" })).toEqual({
      isPlaying: false,
      recent: toGame(730, "Counter-Strike 2"),
    });
  });

  it("is idle without any game", () => {
    expect(toSteamNow(undefined, undefined)).toEqual({ isPlaying: false, recent: null });
  });
});

describe("toGame", () => {
  it("builds store and image urls", () => {
    expect(toGame(570, "Dota 2")).toEqual({
      name: "Dota 2",
      imageUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/570/header.jpg",
      url: "https://store.steampowered.com/app/570",
    });
  });
});

describe("pickRecent", () => {
  const recent = [
    { appid: 400040, name: "ShareX" },
    { appid: 730, name: "Counter-Strike 2" },
    { appid: 227300, name: "Euro Truck Simulator 2" },
    { appid: 280680, name: "Krita" },
  ];
  const hidden = ["ShareX", "Wallpaper Engine"];

  it("take the latest launch instead of the two-week playtime order", () => {
    const lastPlayed = new Map([
      [400040, 300],
      [730, 100],
      [227300, 200],
      [280680, 50],
    ]);
    expect(pickRecent(recent, lastPlayed, hidden)?.name).toBe("Euro Truck Simulator 2");
  });

  it("skip hidden apps but keep other software", () => {
    const lastPlayed = new Map([
      [400040, 300],
      [280680, 250],
      [730, 100],
    ]);
    expect(pickRecent(recent, lastPlayed, hidden)?.name).toBe("Krita");
  });

  it("keep the api order when date are missing", () => {
    expect(pickRecent(recent, new Map(), hidden)?.name).toBe("Counter-Strike 2");
  });

  it("return nothing when only hidden apps were played", () => {
    expect(pickRecent([recent[0]], new Map(), hidden)).toBeUndefined();
  });
});
