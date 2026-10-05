import { describe, expect, it } from "vitest";
import { toGame, toNowSteam } from "./steam";

describe("toNowSteam", () => {
  it("maps the game being played", () => {
    expect(toNowSteam({ gameid: "570", gameextrainfo: "Dota 2" }, undefined)).toEqual({
      isPlaying: true,
      game: toGame("570", "Dota 2"),
    });
  });

  it("falls back to the most recent game", () => {
    expect(toNowSteam({}, { appid: 730, name: "Counter-Strike 2" })).toEqual({
      isPlaying: false,
      recent: toGame(730, "Counter-Strike 2"),
    });
  });

  it("is idle without any game", () => {
    expect(toNowSteam(undefined, undefined)).toEqual({ isPlaying: false, recent: null });
  });
});

describe("toGame", () => {
  it("builds store and image urls", () => {
    expect(toGame(570, "Dota 2")).toEqual({
      name: "Dota 2",
      appId: "570",
      imageUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/570/header.jpg",
      url: "https://store.steampowered.com/app/570",
    });
  });
});
