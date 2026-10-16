import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { defaults, mergeTuning } from "@/lib/tuning";
import { formatDefaults } from "@/lib/tuningFile";

describe("tuning defaults file", () => {
  it("writes unchanged defaults back byte for byte", () => {
    expect(formatDefaults(defaults)).toBe(
      readFileSync(join(process.cwd(), "src/lib/tuningDefaults.ts"), "utf8"),
    );
  });

  it("rounds slider noise", () => {
    const text = formatDefaults(mergeTuning({ flashlight: { falloff: 0.35000000000000003 } }));
    expect(text).toContain("falloff: 0.35,");
  });

  it("keeps the shape of the defaults whatever comes in", () => {
    const merged = mergeTuning({
      sparks: { push: "a lot", extra: 1 },
      unknown: {},
      sparkLook: { size: [1] },
    });
    expect(merged.sparks.push).toBe(defaults.sparks.push);
    expect(merged.sparks).not.toHaveProperty("extra");
    expect(merged).not.toHaveProperty("unknown");
    expect(merged.sparkLook.size).toEqual([1, defaults.sparkLook.size[1]]);
  });
});
