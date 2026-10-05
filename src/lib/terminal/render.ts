import type { Site, StatusState, TerminalRow } from "@/content/types";
import { formatAgo, formatUptime } from "@/lib/format";
import type { Push } from "@/lib/github/push";
import type { NowSpotify } from "@/lib/spotify/types";
import type { NowSteam } from "@/lib/steam/types";
import { fox } from "./fox";

export type Live = {
  spotify: NowSpotify;
  steam: NowSteam;
  pushes: Record<string, Push | null>;
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

type Pair = { key: string; plain: string; colored?: string; mark?: string };

const clip = (s: string, max: number) => (s.length > max ? `${s.slice(0, Math.max(0, max - 1))}…` : s);

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

const steam = (row: Extract<TerminalRow, { type: "steam" }>, now: NowSteam) => {
  if (now.isPlaying) return now.game.name;
  if (now.recent && row.recentText) return row.recentText.replace("{game}", now.recent.name);
  return row.idleText;
};

const pair = (row: TerminalRow, live: Live): Pair | null => {
  switch (row.type) {
    case "text":
      return { key: row.key, plain: row.value };
    case "list":
      return { key: row.key, plain: row.items.join(" · ") };
    case "links": {
      const word = row.word ?? "on";
      const services = row.services.join(" · ");
      return {
        key: row.key,
        plain: `${row.handle} ${word} ${services}`,
        colored: `${strong(row.handle)} ${muted(word)} ${services}`,
      };
    }
    case "status":
      return { key: row.key, plain: row.text, mark: paint(DOT[row.state ?? "online"], "●") };
    case "clock":
      return { key: row.key, plain: clock(row.timeZone) };
    case "spotify":
      return {
        key: row.key,
        plain: live.spotify.isPlaying ? `${live.spotify.title} — ${live.spotify.artist}` : row.idleText,
      };
    case "steam":
      return { key: row.key, plain: steam(row, live.steam) };
    case "github": {
      const push = live.pushes[row.user];
      return {
        key: row.key,
        plain: push
          ? `${push.repo.replace(`${row.user}/`, "")} · ${formatAgo(push.at, live.now)}`
          : row.idleText,
      };
    }
    case "uptime":
      return { key: row.key, plain: formatUptime(live.uptime) };
    case "deploy":
      return { key: row.key, plain: `${formatAgo(live.deploy.time, live.now)} · ${live.deploy.sha}` };
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

export function renderTerminal(site: Site, rows: TerminalRow[], live: Live): string {
  const pairs = new Map(rows.map((row) => [row, pair(row, live)]));
  const width = Math.max(0, ...[...pairs.values()].map((p) => p?.key.length ?? 0));
  const { name } = site.header;
  const host = new URL(site.meta.url).host;

  const kv = ({ key, plain, colored, mark }: Pair) => {
    const room = INFO_WIDTH - width - 2 - (mark ? 2 : 0);
    const value = plain.length > room ? clip(plain, room) : (colored ?? plain);
    return `${accent(key.padEnd(width))}  ${mark ? `${mark} ` : ""}${value}`;
  };

  const info = rows.flatMap((row): string[] => {
    const p = pairs.get(row);
    if (p) return [kv(p)];
    switch (row.type) {
      case "title":
        return [
          `${bold(strong(name))}${muted("@")}${accent(host)}`,
          dim("─".repeat(`${name}@${host}`.length)),
        ];
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
