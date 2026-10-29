import { describe, expect, it } from "vitest";
import { projectDetails } from "./projects";

describe("projectDetails", () => {
  it("are keyed by lowercase repo names", () => {
    for (const slug of Object.keys(projectDetails)) expect(slug).toMatch(/^[a-z0-9._-]+$/);
  });

  it("point icons to paths inside the repo", () => {
    for (const { icon } of Object.values(projectDetails))
      if (icon) expect(icon).not.toMatch(/^[a-z]+:|^\/\//i);
  });
});
