import { describe, expect, it } from "vitest";
import { terminal } from "@/content/terminal";
import { config } from "./proxy";

describe("proxy matcher", () => {
  it("covers every terminal variant", () => {
    const paths = Object.keys(terminal).map((variant) => (variant === "main" ? "/" : `/${variant}`));
    expect([...config.matcher].sort()).toEqual(paths.sort());
  });
});
