export type Point = { x: number; y: number };

export type ContourSample = Point & { nx: number; ny: number };

const CURVE_STEPS = 12;

const NUMBER = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;

const cubic = (p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const e = t * t * t;
  return { x: a * p0.x + b * p1.x + c * p2.x + e * p3.x, y: a * p0.y + b * p1.y + c * p2.y + e * p3.y };
};

const pairs = (args: string) => {
  const numbers = (args.match(NUMBER) ?? []).map(Number);
  const points: Point[] = [];
  for (let i = 0; i + 1 < numbers.length; i += 2) points.push({ x: numbers[i], y: numbers[i + 1] });
  return points;
};

export const flattenPath = (d: string) => {
  const subpaths: Point[][] = [];
  let current: Point[] = [];

  for (const [, command, args] of d.matchAll(/([A-Za-z])([^A-Za-z]*)/g)) {
    const points = pairs(args);
    if (command === "M") {
      if (current.length > 0) subpaths.push(current);
      current = points;
    } else if (command === "L") {
      current.push(...points);
    } else if (command === "C") {
      for (let i = 0; i + 2 < points.length; i += 3) {
        const start = current.at(-1);
        if (!start) throw new Error("path curve has no start point");
        for (let step = 1; step <= CURVE_STEPS; step++) {
          current.push(cubic(start, points[i], points[i + 1], points[i + 2], step / CURVE_STEPS));
        }
      }
    } else if (command !== "Z" && command !== "z") {
      throw new Error(`unsupported path command ${command}`);
    }
  }

  if (current.length > 0) subpaths.push(current);
  return subpaths;
};

export const signedArea = (polygon: Point[]) => {
  let sum = 0;
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return sum / 2;
};

export const outerContour = (d: string) => {
  const subpaths = flattenPath(d);
  if (subpaths.length === 0) throw new Error("path is empty");
  return subpaths.reduce((best, path) =>
    Math.abs(signedArea(path)) > Math.abs(signedArea(best)) ? path : best,
  );
};

export const contains = (polygon: Point[], { x, y }: Point) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
};

const distance = (a: Point, b: Point) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const resampleClosed = (polygon: Point[], count: number, smoothing = 3): ContourSample[] => {
  const ring = [...polygon, polygon[0]];
  const lengths = [0];
  for (let i = 1; i < ring.length; i++) lengths.push(lengths[i - 1] + distance(ring[i - 1], ring[i]));
  const total = lengths[lengths.length - 1];

  const points: Point[] = [];
  let segment = 1;
  for (let k = 0; k < count; k++) {
    const target = (total * k) / count;
    while (lengths[segment] < target) segment++;
    const span = lengths[segment] - lengths[segment - 1];
    const t = span > 0 ? (target - lengths[segment - 1]) / span : 0;
    const a = ring[segment - 1];
    const b = ring[segment];
    points.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  }

  const orientation = signedArea(polygon) > 0 ? 1 : -1;
  return points.map((point, k) => {
    const prev = points[(k - smoothing + count) % count];
    const next = points[(k + smoothing) % count];
    const tx = next.x - prev.x;
    const ty = next.y - prev.y;
    const length = Math.sqrt(tx * tx + ty * ty) || 1;
    return { ...point, nx: (orientation * ty) / length, ny: (-orientation * tx) / length };
  });
};

export const smoothClosed = (polygon: Point[], radius: number): Point[] =>
  polygon.map((_, i) => {
    let x = 0;
    let y = 0;
    for (let k = -radius; k <= radius; k++) {
      const point = polygon[(i + k + polygon.length) % polygon.length];
      x += point.x;
      y += point.y;
    }
    const count = radius * 2 + 1;
    return { x: x / count, y: y / count };
  });

export const nearestOnPolygon = (polygon: Point[], point: Point) => {
  let best = { x: polygon[0].x, y: polygon[0].y, squared: Number.POSITIVE_INFINITY };
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    const ex = b.x - a.x;
    const ey = b.y - a.y;
    const span = ex * ex + ey * ey;
    const t = span > 0 ? Math.min(1, Math.max(0, ((point.x - a.x) * ex + (point.y - a.y) * ey) / span)) : 0;
    const x = a.x + ex * t;
    const y = a.y + ey * t;
    const squared = (point.x - x) * (point.x - x) + (point.y - y) * (point.y - y);
    if (squared < best.squared) best = { x, y, squared };
  }
  return { x: best.x, y: best.y, distance: Math.sqrt(best.squared) };
};

export const keepOutside = (polygon: Point[], point: Point, margin: number): Point => {
  const nearest = nearestOnPolygon(polygon, point);
  const inside = contains(polygon, point);
  if ((!inside && nearest.distance >= margin) || nearest.distance === 0) return point;
  const sign = inside ? -1 : 1;
  return {
    x: nearest.x + (sign * (point.x - nearest.x) * margin) / nearest.distance,
    y: nearest.y + (sign * (point.y - nearest.y) * margin) / nearest.distance,
  };
};
