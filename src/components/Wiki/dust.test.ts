import { describe, expect, it } from "vitest";
import { createDust, moteAlpha, stepDust } from "./dust";

describe("createDust", () => {
  it("scatters motes over the area with density by size", () => {
    const small = createDust(40, 20);
    const large = createDust(160, 20);
    expect(large.motes.length).toBe(small.motes.length * 4);
    for (const { x, y } of large.motes) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(160);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(20);
    }
  });

  it("starts motes at different ages so they do not blink together", () => {
    const ages = new Set(createDust(40, 20).motes.map(({ age }) => age));
    expect(ages.size).toBeGreaterThan(1);
  });
});

describe("stepDust", () => {
  it("keeps the count and every mote inside", () => {
    const dust = createDust(60, 20);
    const count = dust.motes.length;
    for (let i = 0; i < 300; i++) stepDust(dust, 0.05);
    expect(dust.motes).toHaveLength(count);
    for (const mote of dust.motes) {
      expect(mote.x).toBeGreaterThanOrEqual(0);
      expect(mote.x).toBeLessThanOrEqual(60);
      expect(mote.y).toBeGreaterThanOrEqual(0);
      expect(mote.y).toBeLessThanOrEqual(20);
      expect(mote.age).toBeLessThan(mote.life);
    }
  });
});

describe("moteAlpha", () => {
  it("fades in and out over the life", () => {
    const mote = { x: 0, y: 0, vx: 0, vy: 0, life: 2, size: 1 };
    expect(moteAlpha({ ...mote, age: 0 })).toBe(0);
    expect(moteAlpha({ ...mote, age: 1 })).toBe(1);
    expect(moteAlpha({ ...mote, age: 2 })).toBeCloseTo(0);
  });
});
