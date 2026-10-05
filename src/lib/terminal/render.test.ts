import { describe, expect, it } from "vitest";
import { type TerminalVariant, terminal } from "@/content/terminal";
import type { TerminalRow } from "@/content/types";
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
  github: null,
  uptime: 0,
  deploy: { sha: "abc1234", time: "2026-10-05T09:00:00Z" },
  now,
};

const infoColumn = Math.max(...fox.glyphs.map((line) => line.length)) + 3;

const render = (rows: TerminalRow[], overrides: Partial<Live> = {}) =>
  plain(renderTerminal(rows, { ...live, ...overrides }))
    .map((line) => line.slice(infoColumn))
    .join("\n");

describe("renderTerminal", () => {
  it.each(Object.keys(terminal) as TerminalVariant[])("%s fits an 80x24 terminal", (variant) => {
    const lines = plain(renderTerminal(terminal[variant], live));
    expect(lines.length).toBeLessThanOrEqual(fox.glyphs.length);
    for (const line of lines) expect(line.length).toBeLessThanOrEqual(80);
  });

  it("splits a key over lines and keeps the value column", () => {
    const output = render([
      { type: "links", key: "find -\nme on", handle: "@fox", services: ["tg", "gh"] },
      { type: "uptime", key: "uptime" },
    ]);
    expect(output).toMatch(/find - {2}tg · gh\nme on {3}@fox\nuptime {2}0m/);
  });

  it("wraps list items onto the value column", () => {
    const items = ["docker", "nginx", "ci/cd", "linux", "python", "bash", "git", "kubernetes"];
    const output = render([{ type: "list", key: "stack", items }]);
    expect(output).toMatch(
      /stack {2}docker · nginx · ci\/cd · linux ·\n {7}python · bash · git · kubernetes/,
    );
  });

  it("wraps artists keeping the comma at the end of the line", () => {
    const output = render([{ type: "spotify", key: "music", idleText: "" }], {
      spotify: {
        isPlaying: true,
        title: "song",
        artists: ["first artist", "second artist", "third artist"],
        albumImageUrl: "",
        songUrl: "",
        progressMs: 0,
        durationMs: 1,
      },
    });
    expect(output).toMatch(/music {2}first artist, second artist,\n {7}third artist\n {7}song/);
  });

  it("shows the subtitle under the title", () => {
    const output = render([{ type: "title", user: "fox", host: "den", subtitle: "jr devops" }]);
    expect(output).toMatch(/^fox@den\njr devops\n─{9}$/m);
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
        artists: ["band"],
        albumImageUrl: "",
        songUrl: "",
        progressMs: 0,
        durationMs: 1,
      },
      steam: { isPlaying: false, recent: toGame(570, "Dota 2") },
      github: { repo: "fox/site", at: "2026-10-05T11:00:00Z" },
      uptime: 3 * 3600,
    });
    expect(busy).toMatch(/music +band\n +song/);
    expect(busy).toMatch(/game\s+недавно: Dota 2/);
    expect(busy).toMatch(/push\s+site · 1 час назад/);
    expect(busy).toMatch(/uptime\s+3h 0m/);
  });
});
