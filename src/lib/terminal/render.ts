import { theme } from "@/content/theme";
import type { StatusState, TerminalRow } from "@/content/types";
import { formatAgo, formatClock, formatUptime } from "@/lib/format";
import type { GithubPush } from "@/lib/github/github";
import type { SpotifyNow } from "@/lib/spotify/types";
import { fillGame, type SteamNow } from "@/lib/steam/types";
import { fox } from "./fox";

export type Live = {
  spotify: SpotifyNow;
  steam: SteamNow;
  github: GithubPush | null;
  uptime: number;
  deploy: { sha: string; time: string };
  now: Date;
};

type Rgb = readonly [number, number, number];

const rgb = (hex: string): Rgb => [
  Number.parseInt(hex.slice(1, 3), 16),
  Number.parseInt(hex.slice(3, 5), 16),
  Number.parseInt(hex.slice(5, 7), 16),
];

const paint = ([r, g, b]: Rgb, s: string) => `\x1b[38;2;${r};${g};${b}m${s}\x1b[0m`;
const accent = (s: string) => paint(rgb(theme.accent), s);
const muted = (s: string) => paint(rgb(theme.muted), s);
const strong = (s: string) => paint(rgb(theme.strong), s);
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;

const DOT: Record<StatusState, Rgb> = {
  online: rgb(theme.online),
  busy: rgb(theme.accent),
  offline: rgb(theme.muted),
};

const SCREEN = 80;
const GAP = 3;
const ART_WIDTH = Math.max(...fox.glyphs.map((line) => line.length));
const INFO_WIDTH = SCREEN - ART_WIDTH - GAP;

type Part = string | { items: string[]; separator: string };

const clip = (s: string, max: number) => (s.length > max ? `${s.slice(0, Math.max(0, max - 1))}…` : s);

const DOT_SEPARATOR = " · ";

const pack = (items: string[], width: number, separator: string) => {
  const tail = separator.trimEnd();
  const lines: string[] = [];
  let line = "";
  for (const item of items) {
    if (line && `${line}${separator}${item}`.length + tail.length > width) {
      lines.push(`${line}${tail}`);
      line = item;
    } else {
      line = line ? `${line}${separator}${item}` : item;
    }
  }
  if (line) lines.push(line);
  return lines;
};

const wrap = (text: string, width: number) => {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (line && `${line} ${word}`.length > width) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines;
};

const steam = (row: Extract<TerminalRow, { type: "steam" }>, now: SteamNow) => {
  if (now.isPlaying) return now.game.name;
  if (now.recent && row.recentText) return fillGame(row.recentText, now.recent.name);
  return row.idleText;
};

const palette = () =>
  Object.values(fox.palette)
    .map((rgb) => paint(rgb, "███"))
    .join(" ");

const artLine = (row: number) => {
  const glyphs = fox.glyphs[row] ?? "";
  const colors = fox.colors[row] ?? "";
  let out = "";
  let run = "";
  let color = "";
  const flush = () => {
    if (run) out += paint(fox.palette[color as keyof typeof fox.palette], run);
    run = "";
  };
  for (let i = 0; i < glyphs.length; i++) {
    if (glyphs[i] === " ") {
      flush();
      out += " ";
      continue;
    }
    if (colors[i] !== color) flush();
    color = colors[i];
    run += glyphs[i];
  }
  flush();
  return out + " ".repeat(ART_WIDTH - glyphs.length);
};

const compose = (info: string[]) => {
  const top = Math.max(0, Math.floor((fox.glyphs.length - info.length) / 2));
  const column = [...Array<string>(top).fill(""), ...info];
  const height = Math.max(fox.glyphs.length, column.length);
  const lines = Array.from({ length: height }, (_, i) =>
    `${artLine(i)}${" ".repeat(GAP)}${column[i] ?? ""}`.trimEnd(),
  );
  return `${lines.join("\n")}\n`;
};

const keyWidth = (rows: TerminalRow[]) =>
  Math.max(0, ...rows.flatMap((row) => ("key" in row ? row.key.split("\n") : [])).map((line) => line.length));

const kv = (width: number, key: string, parts: Part[], mark?: string) => {
  const keys = key.split("\n");
  const room = INFO_WIDTH - width - 2 - (mark ? 2 : 0);
  const lines = parts.flatMap((part) =>
    typeof part === "string" ? [part] : pack(part.items, room, part.separator),
  );
  return Array.from({ length: Math.max(keys.length, lines.length) }, (_, i) => {
    const prefix = mark ? (i === 0 ? `${mark} ` : "  ") : "";
    return `${accent((keys[i] ?? "").padEnd(width))}  ${prefix}${clip(lines[i] ?? "", room)}`;
  });
};

const github = (row: Extract<TerminalRow, { type: "github" }>, live: Live) => {
  const push = live.github;
  return push ? `${push.repo.replace(`${row.user}/`, "")} · ${formatAgo(push.at, live.now)}` : row.idleText;
};

const lines = (row: TerminalRow, live: Live, width: number): string[] => {
  switch (row.type) {
    case "title": {
      const subtitle = row.subtitle ? wrap(row.subtitle, INFO_WIDTH) : [];
      const rule = Math.max(`${row.user}@${row.host}`.length, ...subtitle.map((line) => line.length));
      return [
        `${bold(strong(row.user))}${muted("@")}${accent(row.host)}`,
        ...subtitle.map(muted),
        dim("─".repeat(rule)),
      ];
    }
    case "blank":
      return [""];
    case "palette":
      return [palette()];
    case "heading":
      return [accent(clip(row.text, INFO_WIDTH))];
    case "paragraph":
      return wrap(row.text, INFO_WIDTH).map(muted);
    case "bullet":
      return [`${accent("›")} ${clip(row.text, INFO_WIDTH - 2)}`];
    case "text":
      return kv(width, row.key, [row.value]);
    case "list":
      return kv(width, row.key, [{ items: row.items, separator: DOT_SEPARATOR }]);
    case "links":
      return kv(width, row.key, [row.services.join(DOT_SEPARATOR), row.handle]);
    case "status":
      return kv(width, row.key, [row.text], paint(DOT[row.state ?? "online"], "●"));
    case "clock":
      return kv(width, row.key, [formatClock(row.timeZone, live.now)]);
    case "spotify":
      return kv(
        width,
        row.key,
        live.spotify.isPlaying
          ? [{ items: live.spotify.artists, separator: ", " }, live.spotify.title]
          : [row.idleText],
      );
    case "steam":
      return kv(width, row.key, [steam(row, live.steam)]);
    case "github":
      return kv(width, row.key, [github(row, live)]);
    case "uptime":
      return kv(width, row.key, [formatUptime(live.uptime)]);
    case "deploy":
      return kv(width, row.key, [`${formatAgo(live.deploy.time, live.now)} · ${live.deploy.sha}`]);
    default:
      return row satisfies never;
  }
};

export function renderTerminal(rows: TerminalRow[], live: Live): string {
  const width = keyWidth(rows);
  return compose(rows.flatMap((row) => lines(row, live, width)));
}
