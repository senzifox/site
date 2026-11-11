import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { terminal } from "@/content/terminal";
import { config, proxy, translatedProjects } from "./proxy";

const request = (path: string, headers: Record<string, string> = {}) =>
  new NextRequest(new URL(path, "https://senzi.dev"), { headers });

describe("proxy matcher", () => {
  it("covers every terminal variant and translated project", () => {
    const terminalPaths = Object.keys(terminal).map((variant) => (variant === "main" ? "/" : `/${variant}`));
    const projectPaths = translatedProjects.map((slug) => `/${slug}`);
    expect([...config.matcher].sort()).toEqual([...terminalPaths, ...projectPaths].sort());
  });
});

describe("proxy for translated projects", () => {
  const [slug] = translatedProjects;

  it("sends foreign browsers to the english page", () => {
    const response = proxy(request(`/${slug}`, { "accept-language": "de-DE,de;q=0.9" }));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(`https://senzi.dev/${slug}/en`);
  });

  it("keeps russian browsers and requests without a language", () => {
    expect(
      proxy(request(`/${slug}`, { "accept-language": "ru-RU,ru;q=0.9,en;q=0.8" })).headers.get("location"),
    ).toBeNull();
    expect(proxy(request(`/${slug}`)).headers.get("location")).toBeNull();
  });

  it("prefers the saved choice over the browser language", () => {
    const response = proxy(request(`/${slug}`, { "accept-language": "en-US", cookie: "lang=ru" }));
    expect(response.headers.get("location")).toBeNull();
  });

  it("saves an explicit choice and drops it from the url", () => {
    const toEnglish = proxy(request(`/${slug}?lang=en`, { "accept-language": "ru" }));
    expect(toEnglish.headers.get("location")).toBe(`https://senzi.dev/${slug}/en`);
    expect(toEnglish.cookies.get("lang")?.value).toBe("en");

    const toRussian = proxy(request(`/${slug}?lang=ru`, { "accept-language": "en" }));
    expect(toRussian.headers.get("location")).toBe(`https://senzi.dev/${slug}`);
    expect(toRussian.cookies.get("lang")?.value).toBe("ru");
  });
});
