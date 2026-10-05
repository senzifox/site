import { describe, expect, it } from "vitest";
import { latestPush } from "./push";

describe("latestPush", () => {
  it("takes the newest push event", () => {
    const events = [
      { type: "WatchEvent", repo: { name: "a/star" }, created_at: "2026-10-05T10:00:00Z" },
      { type: "PushEvent", repo: { name: "a/site" }, created_at: "2026-10-05T09:00:00Z" },
      { type: "PushEvent", repo: { name: "a/old" }, created_at: "2026-10-04T09:00:00Z" },
    ];
    expect(latestPush(events)).toEqual({
      repo: "a/site",
      url: "https://github.com/a/site",
      at: "2026-10-05T09:00:00Z",
    });
  });

  it("returns null without pushes", () => {
    expect(latestPush([])).toBeNull();
  });
});
