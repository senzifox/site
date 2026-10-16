import { describe, expect, it } from "vitest";
import { defaults } from "@/lib/tuning";
import { categories, levaKeys } from "./categories";

describe("dev menu categories", () => {
  it.each(categories.map((category) => [category.folder, category] as const))(
    "%s has unique leva keys without dots",
    (_, category) => {
      const keys = levaKeys(category);
      expect(new Set(keys).size).toBe(keys.length);
      expect(keys.filter((key) => key.includes("."))).toEqual([]);
    },
  );

  it("points every slider at a tuning value of the same shape", () => {
    for (const { sections } of categories) {
      for (const section of sections) {
        const values = defaults[section.key] as Record<string, unknown>;
        for (const key of Object.keys(section.ranges)) {
          expect(typeof values[key] === "number" || Array.isArray(values[key]), `${section.key}.${key}`).toBe(
            true,
          );
        }
      }
    }
  });

  it("has unique folder names", () => {
    const folders = categories.map(({ folder }) => folder);
    expect(new Set(folders).size).toBe(folders.length);
  });
});
