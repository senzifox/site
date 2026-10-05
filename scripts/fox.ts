import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const root = join(import.meta.dirname, "..");
const artPath = join(root, "assets/fox/fox.txt");
const imagePath = join(root, "public/avatar-cutout.png");
const out = join(root, "src/lib/terminal/fox.ts");

const ALPHA_MIN = 40;
const HOODIE_FROM = 13;

const PALETTE = {
  G: [55, 165, 85],
  R: [194, 36, 79],
  B: [52, 112, 178],
  F: [225, 132, 93],
  L: [244, 177, 146],
} as const;

type Key = keyof typeof PALETTE;

const ALL = Object.keys(PALETTE) as Key[];
const HEAD: Key[] = ["G", "F", "L"];

const nearest = (rgb: number[], keys: Key[]) =>
  keys.reduce((best, key) => {
    const distance = (k: Key) => PALETTE[k].reduce((sum, v, i) => sum + (v - rgb[i]) ** 2, 0);
    return distance(key) < distance(best) ? key : best;
  });

const canvas = (await readFile(artPath, "utf8"))
  .replace(/\s+$/, "")
  .split("\n")
  .map((line) => Array.from(line.replaceAll("⠀", " ")));

const rows = canvas.length;
const cols = Math.max(...canvas.map((line) => line.length));
const art = canvas.map((line) => Array.from(line.join("").trimEnd()));

const { data, info } = await sharp(imagePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const alpha = (x: number, y: number) => data[(y * info.width + x) * 4 + 3];

let [left, top, right, bottom] = [info.width, info.height, 0, 0];
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    if (alpha(x, y) === 0) continue;
    left = Math.min(left, x);
    top = Math.min(top, y);
    right = Math.max(right, x + 1);
    bottom = Math.max(bottom, y + 1);
  }
}

const cell = (col: number, row: number) => {
  const x0 = left + Math.floor(((right - left) * col) / cols);
  const x1 = left + Math.ceil(((right - left) * (col + 1)) / cols);
  const y0 = top + Math.floor(((bottom - top) * row) / rows);
  const y1 = top + Math.ceil(((bottom - top) * (row + 1)) / rows);
  const sum = [0, 0, 0];
  let weight = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * info.width + x) * 4;
      const a = data[i + 3];
      for (let c = 0; c < 3; c++) sum[c] += data[i + c] * a;
      weight += a;
    }
  }
  const coverage = weight / ((x1 - x0) * (y1 - y0));
  return { rgb: sum.map((v) => v / (weight || 1)), coverage };
};

const colors = art.map((line, row) =>
  line
    .map((glyph, col) => {
      if (glyph === " ") return " ";
      const { rgb, coverage } = cell(col, row);
      if (coverage < ALPHA_MIN) return "F";
      return nearest(rgb, row >= HOODIE_FROM ? ALL : HEAD);
    })
    .join(""),
);

const glyphs = art.map((line) => line.join(""));
const list = (lines: string[]) => lines.map((line) => `    ${JSON.stringify(line)},`).join("\n");

await writeFile(
  out,
  `export const fox = {
  palette: ${JSON.stringify(PALETTE)},
  glyphs: [
${list(glyphs)}
  ],
  colors: [
${list(colors)}
  ],
} as const;
`,
);

for (const line of colors) console.log(line);
console.log(`fox.ts: ${cols}x${rows}`);
