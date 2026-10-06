import { describe, expect, it } from "vitest";
import {
  contains,
  flattenPath,
  keepOutside,
  nearestOnPolygon,
  outerContour,
  resampleClosed,
  signedArea,
  smoothClosed,
} from "./contour";

const SQUARE = "M 0 0 L 100 0 100 100 0 100 0 0";
const SQUARE_REVERSED = "M 0 0 L 0 100 100 100 100 0 0 0";

describe("flattenPath", () => {
  it("splits subpaths and keeps implicit line pairs", () => {
    const subpaths = flattenPath(`${SQUARE} M 10 10 L 20 10 20 20`);
    expect(subpaths).toHaveLength(2);
    expect(subpaths[0]).toHaveLength(5);
    expect(subpaths[1]).toEqual([
      { x: 10, y: 10 },
      { x: 20, y: 10 },
      { x: 20, y: 20 },
    ]);
  });

  it("flattens cubic curves ending at the endpoint", () => {
    const [path] = flattenPath("M 0 0 C 0 50, 50 100, 100 100 C 150 100, 200 50, 200 0");
    expect(path.length).toBeGreaterThan(20);
    expect(path.at(-1)).toEqual({ x: 200, y: 0 });
    expect(path.every(({ y }) => y >= 0 && y <= 100)).toBe(true);
  });

  it("rejects relative commands", () => {
    expect(() => flattenPath("M 0 0 l 10 10")).toThrow("unsupported path command l");
  });
});

describe("outerContour", () => {
  it("picks the subpath with the largest area", () => {
    const outer = outerContour(`M 10 10 L 20 10 20 20 10 20 ${SQUARE}`);
    expect(Math.abs(signedArea(outer))).toBe(10_000);
  });
});

describe("contains", () => {
  it("tells inside from outside", () => {
    const [square] = flattenPath(SQUARE);
    expect(contains(square, { x: 50, y: 50 })).toBe(true);
    expect(contains(square, { x: 150, y: 50 })).toBe(false);
    expect(contains(square, { x: 50, y: -1 })).toBe(false);
  });
});

describe("resampleClosed", () => {
  it.each([
    ["clockwise", SQUARE],
    ["counter-clockwise", SQUARE_REVERSED],
  ])("spaces points evenly with outward normals (%s)", (_, d) => {
    const [square] = flattenPath(d);
    const samples = resampleClosed(square, 40, 1);
    expect(samples).toHaveLength(40);
    for (const [i, sample] of samples.entries()) {
      const next = samples[(i + 1) % samples.length];
      expect(Math.abs(next.x - sample.x) + Math.abs(next.y - sample.y)).toBeCloseTo(10);
      const outside = { x: sample.x + sample.nx * 5, y: sample.y + sample.ny * 5 };
      expect(contains(square, outside)).toBe(false);
    }
  });
});

describe("nearestOnPolygon", () => {
  it("projects onto the closest edge", () => {
    const [square] = flattenPath(SQUARE);
    expect(nearestOnPolygon(square, { x: 50, y: -20 })).toEqual({ x: 50, y: 0, distance: 20 });
    expect(nearestOnPolygon(square, { x: 50, y: 90 })).toEqual({ x: 50, y: 100, distance: 10 });
  });
});

describe("keepOutside", () => {
  const [square] = flattenPath(SQUARE);

  it("leaves far points alone", () => {
    expect(keepOutside(square, { x: 50, y: -40 }, 20)).toEqual({ x: 50, y: -40 });
  });

  it("pushes near and inside points out to the margin", () => {
    expect(keepOutside(square, { x: 50, y: -5 }, 20)).toEqual({ x: 50, y: -20 });
    expect(keepOutside(square, { x: 50, y: 5 }, 20)).toEqual({ x: 50, y: -20 });
  });
});

describe("smoothClosed", () => {
  it("averages neighbours around the ring", () => {
    const smoothed = smoothClosed(
      [
        { x: 0, y: 0 },
        { x: 30, y: 0 },
        { x: 30, y: 30 },
        { x: 0, y: 30 },
      ],
      1,
    );
    expect(smoothed[0]).toEqual({ x: 10, y: 10 });
    expect(smoothed[2]).toEqual({ x: 20, y: 20 });
  });
});
