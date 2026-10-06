import { describe, expect, it } from "vitest";
import { contains } from "@/lib/contour";
import { silhouette } from "./silhouette";
import { createSparkField, sparkPose } from "./sparks";

const field = createSparkField(silhouette.d);

describe("createSparkField", () => {
  it("is deterministic so server and client render the same sparks", () => {
    expect(createSparkField(silhouette.d)).toEqual(field);
  });

  it("keeps the track above the bottom crop", () => {
    expect(field.track.length).toBeGreaterThan(100);
    expect(field.track.every(({ y }) => y < silhouette.size)).toBe(true);
  });
});

describe("sparkPose", () => {
  it("never puts a spark inside the silhouette", () => {
    for (let time = 0; time <= 120; time += 0.5) {
      for (const spark of field.sparks) {
        const pose = sparkPose(field, spark, time, 1);
        expect(contains(field.outline, pose)).toBe(false);
        expect(pose.alpha).toBeGreaterThanOrEqual(0);
        expect(pose.alpha).toBeLessThanOrEqual(1);
      }
    }
  });

  it("starts without wobble or twinkle", () => {
    const [spark] = field.sparks;
    const still = sparkPose(field, spark, 0, 0);
    expect(sparkPose(field, spark, 0, 0)).toEqual(still);
    expect(still.alpha).toBeLessThanOrEqual(spark.glow);
  });
});
