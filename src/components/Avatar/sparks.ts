import {
  type ContourSample,
  keepOutside,
  outerContour,
  type Point,
  resampleClosed,
  smoothClosed,
} from "@/lib/contour";
import { clamp01, smoothstep } from "@/lib/scroll";
import { tuning } from "@/lib/tuning";

const COUNT = 22;
const SEED = 0x5e2f0c;
const TRACK_SAMPLES = 480;
const CROP_TOUCH = 2;
const CROP_HIDE = 100;
const CROP_FADE = 280;
const SMOOTHING = 8;
const TAU = Math.PI * 2;

type Pick = {
  reach: number;
  speed: number;
  size: number;
  wobble: number;
  wobbleSpeed: number;
  glow: number;
  twinkle: number;
  twinkleSpeed: number;
};

export type Spark = {
  id: number;
  u: number;
  direction: 1 | -1;
  pick: Pick;
  wobblePhase: number;
  twinklePhase: number;
};

export type SparkClock = { drift: number; wobble: number; twinkle: number };

type Crop = { size: number; left: boolean; right: boolean; top: boolean; bottom: boolean };

export type SparkField = {
  outline: Point[];
  track: ContourSample[];
  crop: Crop;
  center: Point;
  length: number;
  sparks: Spark[];
};

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

const cropEdges = (outline: Point[], size: number): Crop => {
  const xs = outline.map(({ x }) => x);
  const ys = outline.map(({ y }) => y);
  return {
    size,
    left: Math.min(...xs) < CROP_TOUCH,
    right: Math.max(...xs) > size - CROP_TOUCH,
    top: Math.min(...ys) < CROP_TOUCH,
    bottom: Math.max(...ys) > size - CROP_TOUCH,
  };
};

export const cropDistance = (crop: Crop, { x, y }: Point) =>
  Math.min(
    crop.left ? x : Number.POSITIVE_INFINITY,
    crop.right ? crop.size - x : Number.POSITIVE_INFINITY,
    crop.top ? y : Number.POSITIVE_INFINITY,
    crop.bottom ? crop.size - y : Number.POSITIVE_INFINITY,
  );

const visibleArc = (samples: ContourSample[], crop: Crop) => {
  const visible = samples.map((sample) => cropDistance(crop, sample) > CROP_HIDE);
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

export const createSparkField = (d: string, size: number): SparkField => {
  const outline = resampleClosed(outerContour(d), TRACK_SAMPLES);
  const crop = cropEdges(outline, size);
  const track = visibleArc(resampleClosed(smoothClosed(outline, SMOOTHING), TRACK_SAMPLES, SMOOTHING), crop);
  const xs = outline.map(({ x }) => x);
  const ys = outline.map(({ y }) => y);
  const center = { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 };
  const length = arcLength(track);
  const rnd = random(SEED);

  const sparks = Array.from({ length: COUNT }, (_, id): Spark => {
    const reach = rnd();
    const u = (id + 0.1 + rnd() * 0.8) / COUNT;
    const direction = rnd() < 0.5 ? -1 : 1;
    const speed = rnd();
    const size = rnd();
    const wobble = rnd();
    const wobbleSpeed = rnd();
    const wobblePhase = rnd() * TAU;
    const glow = rnd();
    const twinkle = rnd();
    const twinkleSpeed = rnd();
    const twinklePhase = rnd() * TAU;
    return {
      id,
      u,
      direction,
      pick: { reach, speed, size, wobble, wobbleSpeed, glow, twinkle, twinkleSpeed },
      wobblePhase,
      twinklePhase,
    };
  });

  return { outline, track, crop, center, length, sparks };
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

const edgeFade = (crop: Crop, point: Point) =>
  smoothstep(clamp01((cropDistance(crop, point) - CROP_HIDE) / (CROP_FADE - CROP_HIDE)));

const between = ([min, max]: number[], t: number) => min + (max - min) * t;

export const sparkSize = (spark: Spark) => between(tuning.sparkLook.size, spark.pick.size);

export const sparkRates = (field: SparkField, spark: Spark): SparkClock => {
  const look = tuning.sparkLook;
  return {
    drift: (spark.direction * between(look.speed, spark.pick.speed)) / field.length,
    wobble: between(look.wobbleSpeed, spark.pick.wobbleSpeed),
    twinkle: between(look.twinkleSpeed, spark.pick.twinkleSpeed),
  };
};

export const clockAt = (field: SparkField, spark: Spark, time: number): SparkClock => {
  const rates = sparkRates(field, spark);
  return { drift: rates.drift * time, wobble: rates.wobble * time, twinkle: rates.twinkle * time };
};

export const keepClear = (field: SparkField, point: Point) =>
  keepOutside(field.outline, point, tuning.sparkLook.margin);

export const sparkPose = (field: SparkField, spark: Spark, clock: SparkClock, motion: number): SparkPose => {
  const look = tuning.sparkLook;
  const { pick } = spark;
  const point = trackAt(field.track, triangle(spark.u + clock.drift));
  const swing = between(look.wobble, pick.wobble);
  const wobble = motion * swing * Math.sin(clock.wobble + spark.wobblePhase);
  const offset = Math.max(0, look.offset + look.spread * pick.reach * pick.reach + wobble);
  const flicker = between(look.twinkle, pick.twinkle);
  const twinkle = motion * flicker * Math.sin(clock.twinkle + spark.twinklePhase);
  const { x, y } = keepClear(field, { x: point.x + point.nx * offset, y: point.y + point.ny * offset });
  return {
    x,
    y,
    alpha: clamp01(between(look.glow, pick.glow) + twinkle) * edgeFade(field.crop, point),
  };
};
