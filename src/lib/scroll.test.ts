import { describe, expect, it } from "vitest";
import {
  backdropProgress,
  clamp01,
  fadeOut,
  headerProgress,
  lerp,
  lightProgress,
  smoothstep,
} from "./scroll";

describe("scroll math", () => {
  it("clamps to the unit interval", () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(0.4)).toBe(0.4);
    expect(clamp01(3)).toBe(1);
  });

  it("interpolates linearly", () => {
    expect(lerp(10, 20, 0)).toBe(10);
    expect(lerp(10, 20, 0.5)).toBe(15);
    expect(lerp(10, 20, 1)).toBe(20);
  });

  it("smoothstep keeps endpoints and midpoint", () => {
    expect(smoothstep(0)).toBe(0);
    expect(smoothstep(0.5)).toBe(0.5);
    expect(smoothstep(1)).toBe(1);
    expect(smoothstep(0.25)).toBeLessThan(0.25);
  });

  it("maps header scroll over 300px", () => {
    expect(headerProgress(0)).toBe(0);
    expect(headerProgress(150)).toBe(0.5);
    expect(headerProgress(900)).toBe(1);
  });

  it("eases light over 600px", () => {
    expect(lightProgress(0)).toBe(0);
    expect(lightProgress(300)).toBe(0.75);
    expect(lightProgress(1200)).toBe(1);
  });

  it("shows header backdrop only at the end of the collapse", () => {
    expect(backdropProgress(0.85)).toBe(0);
    expect(backdropProgress(0.925)).toBeCloseTo(0.5);
    expect(backdropProgress(1)).toBe(1);
  });

  it("fades out at the given speed", () => {
    expect(fadeOut(0, 3)).toBe(1);
    expect(fadeOut(0.5, 3)).toBe(0);
    expect(fadeOut(0.25, 2)).toBe(0.5);
  });
});
