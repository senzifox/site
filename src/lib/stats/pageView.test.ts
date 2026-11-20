import { describe, expect, it } from "vitest";
import { pageViewUrl } from "./pageView";

const view = { path: "/foxyfriends/en", title: "foxyfriends · senzi", referrer: "", query: "", width: 1920 };

describe("pageViewUrl", () => {
  it("encodes path, title and screen width", () => {
    const url = new URL(pageViewUrl(view, "abc12"), "https://senzi.dev");
    expect(url.pathname).toBe("/s");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      p: "/foxyfriends/en",
      t: "foxyfriends · senzi",
      s: "1920",
      rnd: "abc12",
    });
  });

  it("adds referrer and query only when present", () => {
    const url = new URL(
      pageViewUrl({ ...view, referrer: "https://github.com/", query: "?utm_source=x" }, "r"),
      "https://senzi.dev",
    );
    expect(url.searchParams.get("r")).toBe("https://github.com/");
    expect(url.searchParams.get("q")).toBe("?utm_source=x");
  });
});
