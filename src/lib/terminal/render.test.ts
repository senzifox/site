import { describe, expect, it } from "vitest";
import { site } from "@/content/site";
import { terminal } from "@/content/terminal";
import type { TerminalRow, TerminalVariant } from "@/content/types";
import { spotifyIdle } from "@/lib/spotify/types";
import { toGame } from "@/lib/steam/steam";
import { steamIdle } from "@/lib/steam/types";
import { fox } from "./fox";
import { type Live, renderTerminal } from "./render";

const ansi = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g");
const plain = (output: string) => output.replace(ansi, "").trimEnd().split("\n");

const now = new Date("2026-10-05T12:00:00Z");
const live: Live = {
  spotify: spotifyIdle,
  steam: steamIdle,
  pushes: {},
  uptime: 0,
  deploy: { sha: "abc1234", time: "2026-10-05T09:00:00Z" },
  now,
};

const render = (rows: TerminalRow[], overrides: Partial<Live> = {}) =>
  plain(renderTerminal(site, rows, { ...live, ...overrides })).join("\n");

describe("renderTerminal", () => {
  it.each(Object.keys(terminal) as TerminalVariant[])("%s fits an 80x24 terminal", (variant) => {
    const lines = plain(renderTerminal(site, terminal[variant], live));
    expect(lines.length).toBeLessThanOrEqual(fox.glyphs.length);
    for (const line of lines) expect(line.length).toBeLessThanOrEqual(80);
  });

  it("merges socials into one links row", () => {
    const output = render([{ type: "links", key: "find me", handle: "@fox", services: ["tg", "gh"] }]);
    expect(output).toMatch(/find me {2}@fox on tg · gh/);
  });

  it("shows live data with idle fallbacks", () => {
    const rows: TerminalRow[] = [
      { type: "spotify", key: "music", idleText: "тишина" },
      { type: "steam", key: "game", idleText: "не играю", recentText: "недавно: {game}" },
      { type: "github", key: "push", user: "fox", idleText: "нет пушей" },
      { type: "uptime", key: "uptime" },
      { type: "deploy", key: "deploy" },
    ];

    const quiet = render(rows);
    expect(quiet).toMatch(/music\s+тишина/);
    expect(quiet).toMatch(/game\s+не играю/);
    expect(quiet).toMatch(/push\s+нет пушей/);
    expect(quiet).toMatch(/uptime\s+0m/);
    expect(quiet).toMatch(/deploy\s+3 часа назад · abc1234/);

    const busy = render(rows, {
      spotify: {
        isPlaying: true,
        title: "song",
        artist: "band",
        albumImageUrl: "",
        songUrl: "",
        progressMs: 0,
        durationMs: 1,
      },
      steam: { isPlaying: false, recent: toGame(570, "Dota 2") },
      pushes: { fox: { repo: "fox/site", url: "", at: "2026-10-05T11:00:00Z" } },
      uptime: 3 * 3600,
    });
    expect(busy).toMatch(/music\s+song — band/);
    expect(busy).toMatch(/game\s+недавно: Dota 2/);
    expect(busy).toMatch(/push\s+site · 1 час назад/);
    expect(busy).toMatch(/uptime\s+3h 0m/);
  });
});
