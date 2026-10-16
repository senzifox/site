import { describe, expect, it } from "vitest";
import { parsePresets, presetName } from "@/lib/presetsFile";
import { defaults } from "@/lib/tuning";

describe("presets file", () => {
  it("accepts trimmed names up to 60 characters", () => {
    expect(presetName("  мягко ")).toBe("мягко");
    expect(presetName("")).toBeNull();
    expect(presetName("   ")).toBeNull();
    expect(presetName(42)).toBeNull();
    expect(presetName("x".repeat(61))).toBeNull();
  });

  it("fills every preset up to the current defaults shape", () => {
    const presets = parsePresets(JSON.stringify({ мягко: { flip: { ms: 900 } } }));
    expect(presets.мягко.flip.ms).toBe(900);
    expect(presets.мягко.sparks).toEqual(defaults.sparks);
  });

  it("drops junk instead of failing", () => {
    expect(parsePresets("[1, 2]")).toEqual({});
    expect(Object.keys(parsePresets(JSON.stringify({ " ": {}, ok: {} })))).toEqual(["ok"]);
  });
});
