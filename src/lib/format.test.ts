import { describe, expect, it } from "vitest";
import { formatTime, stripWhitespace } from "./format";

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
