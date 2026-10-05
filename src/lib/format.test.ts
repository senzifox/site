import { describe, expect, it } from "vitest";
import { formatAgo, formatTime, formatUptime, stripWhitespace } from "./format";

describe("formatTime", () => {
  it("formats minutes and padded seconds", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(9_999)).toBe("0:09");
    expect(formatTime(94_000)).toBe("1:34");
    expect(formatTime(3_600_000)).toBe("60:00");
  });

  it("never goes negative", () => {
    expect(formatTime(-500)).toBe("0:00");
  });
});

describe("stripWhitespace", () => {
  it("removes all whitespace", () => {
    expect(stripWhitespace("0000 0000\t0000 0000")).toBe("0000000000000000");
  });
});

describe("formatUptime", () => {
  it("drops leading empty units", () => {
    expect(formatUptime(30)).toBe("0m");
    expect(formatUptime(125 * 60)).toBe("2h 5m");
    expect(formatUptime(3 * 86_400 + 60)).toBe("3d 0h 1m");
  });
});

describe("formatAgo", () => {
  const now = new Date("2026-10-05T12:00:00Z");

  it("formats relative russian time", () => {
    expect(formatAgo("2026-10-05T11:59:30Z", now)).toBe("только что");
    expect(formatAgo("2026-10-05T11:55:00Z", now)).toBe("5 минут назад");
    expect(formatAgo("2026-10-05T09:00:00Z", now)).toBe("3 часа назад");
    expect(formatAgo("2026-10-04T12:00:00Z", now)).toBe("вчера");
  });
});
