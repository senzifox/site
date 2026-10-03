import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
import type { IconifyJSON } from "@iconify/types";
import { getIconData, iconToSVG } from "@iconify/utils";
import { type IconSource, iconSources, setScale } from "../src/content/icons.ts";

const require = createRequire(import.meta.url);
const out = join(import.meta.dirname, "../src/components/Icon/icons.ts");

const sets = new Map<string, IconifyJSON>();

const loadSet = async (prefix: string) => {
  const cached = sets.get(prefix);
  if (cached) return cached;
  const file = require.resolve(`@iconify-json/${prefix}/icons.json`);
  const set = JSON.parse(await readFile(file, "utf8")) as IconifyJSON;
  sets.set(prefix, set);
  return set;
};

const round = (n: number) => Math.round(n * 1000) / 1000;

const scaledViewBox = (viewBox: string, scale: number) => {
  const [x, y, w, h] = viewBox.split(" ").map(Number);
  const width = w / scale;
  const height = h / scale;
  return [x - (width - w) / 2, y - (height - h) / 2, width, height].map(round).join(" ");
};

const monochrome = (body: string) =>
  body
    .replace(/\s(fill|stroke)="(?!none)[^"]*"/g, ' $1="currentColor"')
    .replace(/\sstyle="[^"]*"/g, "")
    .replace(/\s+/g, " ")
    .trim();

const build = async (name: string, source: IconSource) => {
  const { icon, scale } = typeof source === "string" ? { icon: source, scale: undefined } : source;
  const [prefix, iconName] = icon.split(":");
  const data = getIconData(await loadSet(prefix), iconName);
  if (!data) throw new Error(`${name}: icon ${icon} not found`);
  const { attributes, body } = iconToSVG(data);
  return {
    viewBox: scaledViewBox(attributes.viewBox, scale ?? setScale[prefix] ?? 1),
    body: monochrome(body),
  };
};

const entries = await Promise.all(
  Object.entries(iconSources).map(async ([name, source]) => [name, await build(name, source)] as const),
);

const lines = entries.map(
  ([name, { viewBox, body }]) => `  ${name}: { viewBox: "${viewBox}", body: ${JSON.stringify(body)} },`,
);

await writeFile(
  out,
  `export const icons = {\n${lines.join("\n")}\n} as const;\n\nexport type IconName = keyof typeof icons;\n`,
);

console.log(`icons.ts: ${entries.length} icons`);
