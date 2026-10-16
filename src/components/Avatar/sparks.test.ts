import { describe, expect, it } from "vitest";
import { contains } from "@/lib/contour";
import { defaults } from "@/lib/tuning";
import { avatars } from "./silhouette";
import { clockAt, createSparkField, cropDistance, sparkPose } from "./sparks";

describe.each(avatars.map((avatar, i) => [i + 1, avatar] as const))("avatar %i", (_, { d, size }) => {
  const field = createSparkField(d, size);

  it("is deterministic so server and client render the same sparks", () => {
    expect(createSparkField(d, size)).toEqual(field);
  });

  it("keeps the track away from cropped edges", () => {
    expect(field.track.length).toBeGreaterThan(100);
    expect(field.track.every((point) => cropDistance(field.crop, point) > 100)).toBe(true);
  });

  it("never puts a spark inside the silhouette", () => {
    for (let time = 0; time <= 120; time += 0.5) {
      for (const spark of field.sparks) {
        const pose = sparkPose(field, spark, clockAt(field, spark, time), 1);
        expect(contains(field.outline, pose)).toBe(false);
        expect(pose.alpha).toBeGreaterThanOrEqual(0);
        expect(pose.alpha).toBeLessThanOrEqual(1);
      }
    }
  });

  it("moves only through its clock", () => {
    const [spark] = field.sparks;
    const still = sparkPose(field, spark, clockAt(field, spark, 0), 0);
    expect(sparkPose(field, spark, clockAt(field, spark, 0), 0)).toEqual(still);
    expect(sparkPose(field, spark, clockAt(field, spark, 7), 0)).not.toEqual(still);
  });
});

describe("layout", () => {
  const [{ d, size }] = avatars;

  it("follows the tuned count", () => {
    expect(createSparkField(d, size, { ...defaults.sparkLayout, count: 5 }).sparks).toHaveLength(5);
  });

  it("rounds fractional slider values", () => {
    const field = createSparkField(d, size, { ...defaults.sparkLayout, count: 7.4, trackSamples: 300.2 });
    expect(field.sparks).toHaveLength(7);
    expect(field.outline).toHaveLength(300);
  });

  it("keeps a usable track when the edge hides everything", () => {
    const field = createSparkField(d, size, { ...defaults.sparkLayout, cropHide: 5000 });
    expect(field.track.length).toBeGreaterThan(1);
    const [spark] = field.sparks;
    expect(Number.isFinite(sparkPose(field, spark, clockAt(field, spark, 3), 1).x)).toBe(true);
  });
});

describe("crop detection", () => {
  it("marks only the image edges the outline reaches", () => {
    const { crop } = createSparkField("M 300 200 L 1000 200 1280 700 1280 1280 300 1280 300 200", 1280);
    expect(crop).toMatchObject({ bottom: true, right: true, left: false, top: false });
  });

  it("treats every avatar as a bust cut at the bottom", () => {
    for (const { d, size } of avatars) expect(createSparkField(d, size).crop.bottom).toBe(true);
  });
});
