import { describe, expect, it } from "vitest";
import { acceptedLang, langPath, preferredLang } from "./lang";

describe("acceptedLang", () => {
  it("is unknown without the header", () => {
    expect(acceptedLang(null)).toBeNull();
    expect(acceptedLang(" ")).toBeNull();
  });

  it("picks the best supported language by quality", () => {
    expect(acceptedLang("ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7")).toBe("ru");
    expect(acceptedLang("en-US,en;q=0.9,ru;q=0.8")).toBe("en");
    expect(acceptedLang("de;q=0.9,en;q=0.5,ru;q=0.7")).toBe("ru");
    expect(acceptedLang("ru;q=0,en;q=0.1")).toBe("en");
  });

  it("falls back to english for other languages", () => {
    expect(acceptedLang("de-DE,de;q=0.9")).toBe("en");
    expect(acceptedLang("*")).toBe("en");
  });
});

describe("langPath", () => {
  it("keeps the default language at the base path", () => {
    expect(langPath("/mod", "ru")).toBe("/mod");
    expect(langPath("/mod/wiki", "en")).toBe("/mod/wiki/en");
  });
});

describe("preferredLang", () => {
  it("prefers a saved choice over the browser languages", () => {
    expect(preferredLang("ru", "en-US")).toBe("ru");
    expect(preferredLang("de", "en-US")).toBe("en");
    expect(preferredLang(undefined, null)).toBeNull();
  });
});
