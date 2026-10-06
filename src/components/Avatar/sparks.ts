import {
  type ContourSample,
  keepOutside,
  outerContour,
  type Point,
  resampleClosed,
  smoothClosed,
} from "@/lib/contour";
import { clamp01, smoothstep } from "@/lib/scroll";

const COUNT = 22;
const SEED = 0x5e2f0c;
const TRACK_SAMPLES = 480;
const FADE_FROM = 1000;
const FADE_TO = 1180;
const SMOOTHING = 8;
const MARGIN = 28;
const TAU = Math.PI * 2;

export type Spark = {
  id: number;
  u: number;
  speed: number;
  offset: number;
  r: number;
  wobble: number;
  wobbleFreq: number;
  wobblePhase: number;
  glow: number;
  twinkle: number;
  twinkleFreq: number;
  twinklePhase: number;
};

export type SparkField = { outline: Point[]; track: ContourSample[]; center: Point; sparks: Spark[] };

export type SparkPose = { x: number; y: number; alpha: number };

const random = (seed: number) => {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const visibleArc = (samples: ContourSample[]) => {
  const visible = samples.map(({ y }) => y < FADE_TO);
  const firstHidden = visible.indexOf(false);
  if (firstHidden === -1) return samples;
  let best = { start: 0, length: 0 };
  let run = 0;
  for (let k = 1; k <= samples.length; k++) {
    const i = (firstHidden + k) % samples.length;
    run = visible[i] ? run + 1 : 0;
    if (run > best.length) best = { start: i - run + 1, length: run };
  }
  return Array.from(
    { length: best.length },
    (_, k) => samples[(best.start + k + samples.length) % samples.length],
  );
};

const arcLength = (points: Point[]) => {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
};

export const createSparkField = (d: string): SparkField => {
  const outline = resampleClosed(outerContour(d), TRACK_SAMPLES);
  const track = visibleArc(resampleClosed(smoothClosed(outline, SMOOTHING), TRACK_SAMPLES, SMOOTHING));
  const xs = outline.map(({ x }) => x);
  const ys = outline.map(({ y }) => y);
  const center = { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 };
  const length = arcLength(track);
  const rnd = random(SEED);

  const sparks = Array.from({ length: COUNT }, (_, id) => {
    const reach = rnd();
    return {
      id,
      u: (id + 0.1 + rnd() * 0.8) / COUNT,
      speed: ((rnd() < 0.5 ? -1 : 1) * (14 + rnd() * 26)) / length,
      offset: MARGIN + 12 + 120 * reach * reach,
      r: 6 + rnd() * 8,
      wobble: 8 + rnd() * 20,
      wobbleFreq: 0.35 + rnd() * 0.6,
      wobblePhase: rnd() * TAU,
      glow: 0.45 + rnd() * 0.45,
      twinkle: 0.12 + rnd() * 0.25,
      twinkleFreq: 0.6 + rnd() * 1.4,
      twinklePhase: rnd() * TAU,
    };
  });

  return { outline, track, center, sparks };
};

const triangle = (x: number) => {
  const m = ((x % 2) + 2) % 2;
  return m < 1 ? m : 2 - m;
};

const trackAt = (track: ContourSample[], u: number) => {
  const f = u * (track.length - 1);
  const i = Math.floor(f);
  const a = track[i];
  const b = track[Math.min(i + 1, track.length - 1)];
  const k = f - i;
  const mix = (from: number, to: number) => from + (to - from) * k;
  return {
    x: mix(a.x, b.x),
    y: mix(a.y, b.y),
    nx: mix(a.nx, b.nx),
    ny: mix(a.ny, b.ny),
  };
};

const edgeFade = (y: number) => 1 - smoothstep(clamp01((y - FADE_FROM) / (FADE_TO - FADE_FROM)));

export const keepClear = (field: SparkField, point: Point) => keepOutside(field.outline, point, MARGIN);

export const sparkPose = (field: SparkField, spark: Spark, time: number, motion: number): SparkPose => {
  const point = trackAt(field.track, triangle(spark.u + spark.speed * time));
  const wobble = motion * spark.wobble * Math.sin(spark.wobbleFreq * time + spark.wobblePhase);
  const offset = Math.max(0, spark.offset + wobble);
  const twinkle = motion * spark.twinkle * Math.sin(spark.twinkleFreq * time + spark.twinklePhase);
  const { x, y } = keepClear(field, { x: point.x + point.nx * offset, y: point.y + point.ny * offset });
  return {
    x,
    y,
    alpha: clamp01(spark.glow + twinkle) * edgeFade(point.y),
  };
};
