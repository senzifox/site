import { describe, expect, it } from "vitest";
import { dateState, formatInDays, formatPercent, parseMoment, plural, splitDuration } from "./countdown";

const MSK = "Europe/Moscow";
const at = (iso: string) => new Date(iso).getTime();

describe("parseMoment", () => {
  it("reads yearly and one-shot dates", () => {
    expect(parseMoment("01-01")).toEqual({ year: undefined, month: 1, day: 1, hour: 0, minute: 0 });
    expect(parseMoment("2027-03-08T09:30")).toEqual({ year: 2027, month: 3, day: 8, hour: 9, minute: 30 });
  });

  it("rejects garbage", () => {
    expect(parseMoment("13-01")).toBeNull();
    expect(parseMoment("завтра")).toBeNull();
  });
});

describe("dateState", () => {
  it("counts down to the next new year in the zone", () => {
    const state = dateState("01-01", MSK, "countdown", at("2026-10-25T12:00:00Z"));
    expect(state?.target).toBe(at("2026-12-31T21:00:00Z"));
    expect(state?.done).toBe(false);
    expect(state?.progress?.year).toBe(2026);
    expect(state?.progress?.value).toBeCloseTo(0.8154, 3);
  });

  it("celebrates for a day, then moves to the next year", () => {
    expect(dateState("01-01", MSK, "countdown", at("2027-01-01T05:00:00Z"))?.done).toBe(true);
    const after = dateState("01-01", MSK, "countdown", at("2027-01-01T22:00:00Z"));
    expect(after?.done).toBe(false);
    expect(after?.target).toBe(at("2027-12-31T21:00:00Z"));
  });

  it("handles one-shot dates and counting up", () => {
    expect(dateState("2026-10-01", MSK, "countdown", at("2026-10-25T00:00:00Z"))?.done).toBe(true);
    expect(dateState("2026-10-24", MSK, "since", at("2026-10-25T21:00:00Z"))?.ms).toBe(2 * 86_400_000);
  });

  it("returns null for a bad date or zone", () => {
    expect(dateState("nope", MSK, "countdown", 0)).toBeNull();
    expect(dateState("01-01", "Mars/Olympus", "countdown", 0)).toBeNull();
  });
});

describe("helpers", () => {
  it("splits a duration", () => {
    expect(splitDuration(((67 * 24 + 5) * 3600 + 12 * 60 + 33) * 1000)).toEqual({
      days: 67,
      hours: 5,
      minutes: 12,
      seconds: 33,
    });
  });

  it("picks russian plural forms", () => {
    const days = ["день", "дня", "дней"] as const;
    expect([1, 3, 5, 11, 21, 67].map((n) => plural(n, days))).toEqual([
      "день",
      "дня",
      "дней",
      "дней",
      "день",
      "дней",
    ]);
  });

  it("formats percent and relative days", () => {
    expect(formatPercent(0.8165)).toBe("81.7%");
    expect(formatInDays(at("2027-01-01T00:00:00Z"), at("2026-10-25T00:00:00Z"))).toBe("через 68 дней");
  });
});
