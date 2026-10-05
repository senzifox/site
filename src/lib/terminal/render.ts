import type { StatusState, TerminalRow } from "@/content/types";
import { formatAgo, formatUptime } from "@/lib/format";
import type { GithubPush } from "@/lib/github/github";
import type { SpotifyNow } from "@/lib/spotify/types";
import { fillGame, type SteamNow } from "@/lib/steam/types";
import { fox } from "./fox";

export type Live = {
  spotify: SpotifyNow;
  steam: SteamNow;
  pushes: Record<string, GithubPush | null>;
  uptime: number;
  deploy: { sha: string; time: string };
  now: Date;
};

type Rgb = readonly [number, number, number];

const paint = ([r, g, b]: Rgb, s: string) => `\x1b[38;2;${r};${g};${b}m${s}\x1b[0m`;
const accent = (s: string) => paint([242, 163, 107], s);
const muted = (s: string) => paint([168, 162, 178], s);
const strong = (s: string) => paint([244, 240, 248], s);
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;

const DOT: Record<StatusState, Rgb> = {
  online: [108, 211, 138],
  busy: [242, 163, 107],
  offline: [168, 162, 178],
};

const SCREEN = 80;
const GAP = 3;
const ART_WIDTH = Math.max(...fox.glyphs.map((line) => line.length));
const INFO_WIDTH = SCREEN - ART_WIDTH - GAP;

type Part = string | { items: string[]; separator: string };

type Field = { key: string; parts: Part[]; mark?: string };

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

const clock = (timeZone: string) => {
  try {
    return new Intl.DateTimeFormat("ru-RU", { timeZone, hour: "2-digit", minute: "2-digit" }).format(
      new Date(),
    );
  } catch {
    return "";
  }
};

const steam = (row: Extract<TerminalRow, { type: "steam" }>, now: SteamNow) => {
  if (now.isPlaying) return now.game.name;
  if (now.recent && row.recentText) return fillGame(row.recentText, now.recent.name);
  return row.idleText;
};

const field = (row: TerminalRow, live: Live): Field | null => {
  switch (row.type) {
    case "text":
      return { key: row.key, parts: [row.value] };
    case "list":
      return { key: row.key, parts: [{ items: row.items, separator: DOT_SEPARATOR }] };
    case "links":
      return { key: row.key, parts: [row.services.join(DOT_SEPARATOR), row.handle] };
    case "status":
      return { key: row.key, parts: [row.text], mark: paint(DOT[row.state ?? "online"], "●") };
    case "clock":
      return { key: row.key, parts: [clock(row.timeZone)] };
    case "spotify":
      return {
        key: row.key,
        parts: live.spotify.isPlaying
          ? [{ items: live.spotify.artists, separator: ", " }, live.spotify.title]
          : [row.idleText],
      };
    case "steam":
      return { key: row.key, parts: [steam(row, live.steam)] };
    case "github": {
      const push = live.pushes[row.user];
      return {
        key: row.key,
        parts: [
          push ? `${push.repo.replace(`${row.user}/`, "")} · ${formatAgo(push.at, live.now)}` : row.idleText,
        ],
      };
    }
    case "uptime":
      return { key: row.key, parts: [formatUptime(live.uptime)] };
    case "deploy":
      return { key: row.key, parts: [`${formatAgo(live.deploy.time, live.now)} · ${live.deploy.sha}`] };
    default:
      return null;
  }
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

export function renderTerminal(rows: TerminalRow[], live: Live): string {
  const fields = new Map(rows.map((row) => [row, field(row, live)]));
  const keyLines = [...fields.values()].flatMap((f) => f?.key.split("\n") ?? []);
  const width = Math.max(0, ...keyLines.map((line) => line.length));

  const kv = ({ key, parts, mark }: Field) => {
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

  const info = rows.flatMap((row): string[] => {
    const f = fields.get(row);
    if (f) return kv(f);
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
      default:
        return [];
    }
  });

  return compose(info);
}
