import { writeFile } from "node:fs/promises";
import { join } from "node:path";

const out = join(import.meta.dirname, "../src/components/Footer/tail.ts");

const WIDTH = 64;
const HEIGHT = 32;
const BASE_X = 3;
const TIP_X = 61;
const AMPLITUDE = 4.2;
const WAVES = 1;
const SAMPLES = 72;
const TUFTS = 4;
const FLUFF = 0.24;
const PHASES = [0, 0.9, -0.7, 0.4, 0, 0];
const KEY_TIMES = [0, 0.14, 0.3, 0.44, 0.6, 1];

type Point = [number, number];

const center = (t: number, phase: number): Point => {
  const k = Math.PI * 2 * WAVES;
  const ramp = Math.min(1, t / 0.18);
  const anchor = ramp * ramp * (3 - 2 * ramp);
  return [BASE_X + (TIP_X - BASE_X) * t, HEIGHT / 2 - AMPLITUDE * anchor * Math.sin(k * t + phase)];
};

const halfWidth = (t: number) => 1.2 * (1 - t) + 6.4 * Math.sin(Math.PI * t) ** 1.1;

const fluff = (t: number, offset: number) => {
  const phase = TUFTS * t + offset;
  const tuft = (phase - Math.floor(phase)) ** 1.4;
  const fade = Math.sin(Math.PI * t) ** 2;
  return 1 + FLUFF * fade * (tuft - 0.5);
};

const outline = (phase: number) => {
  const top: Point[] = [];
  const bottom: Point[] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const [x, y] = center(t, phase);
    const [ax, ay] = center(Math.max(0, t - 0.01), phase);
    const [bx, by] = center(Math.min(1, t + 0.01), phase);
    const length = Math.hypot(bx - ax, by - ay);
    const nx = -(by - ay) / length;
    const ny = (bx - ax) / length;
    const w = halfWidth(t);
    const wTop = w * fluff(t, 0);
    const wBottom = w * fluff(t, 0.5);
    top.push([x + nx * wTop, y + ny * wTop]);
    bottom.push([x - nx * wBottom, y - ny * wBottom]);
  }
  return [...top, ...bottom.slice(0, -1).reverse()];
};

const strand = (phase: number) =>
  Array.from({ length: 9 }, (_, i) => {
    const t = 0.18 + (i / 8) * 0.5;
    const [x, y] = center(t, phase);
    return [x, y + halfWidth(t) * 0.35] as Point;
  });

const round = (n: number) => Math.round(n * 10) / 10;

const TIP_START = round(BASE_X + (TIP_X - BASE_X) * 0.76);

const tipCut = () => {
  const zigzag = [-1, 2.5, -1, 2, -1.5, 2, -1, 2.5].map(
    (dx, i) => `L${round(TIP_START + dx)} ${round((i * HEIGHT) / 7)}`,
  );
  return `M${TIP_START} -2${zigzag.join("")}L${TIP_START} ${HEIGHT + 2}H${WIDTH + 2}V-2Z`;
};

const smooth = (points: Point[], closed: boolean) => {
  const at = (i: number) =>
    closed
      ? points[(i + points.length) % points.length]
      : points[Math.min(points.length - 1, Math.max(0, i))];
  const last = closed ? points.length : points.length - 1;
  let d = `M${round(points[0][0])} ${round(points[0][1])}`;
  for (let i = 0; i < last; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${[c1, c2, p2].map(([x, y]) => `${round(x)} ${round(y)}`).join(" ")}`;
  }
  return closed ? `${d}Z` : d;
};

const shapes = PHASES.map((phase) => smooth(outline(phase), true));
const strands = PHASES.map((phase) => smooth(strand(phase), false));

await writeFile(
  out,
  `export const tail = {
  width: ${WIDTH},
  height: ${HEIGHT},
  tip: "${tipCut()}",
  keyTimes: "${KEY_TIMES.join(";")}",
  shapes: ${JSON.stringify(shapes)},
  strands: ${JSON.stringify(strands)},
};
`,
);

console.log(`tail.ts: ${shapes.length} frames, ${(shapes[0].length / 1024).toFixed(1)} KB per frame`);
