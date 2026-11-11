import { describe, expect, it } from "vitest";
import {
  type GithubRepo,
  projectLangChoice,
  projectLangs,
  projectPath,
  toProjects,
  toRelease,
} from "./projects";

const repo = (name: string, overrides: Partial<GithubRepo> = {}): GithubRepo => ({
  name,
  full_name: `fox/${name}`,
  description: `${name} description`,
  topics: ["fox", "java"],
  html_url: `https://github.com/fox/${name}`,
  homepage: "",
  fork: false,
  archived: false,
  private: false,
  pushed_at: "2026-10-01T00:00:00Z",
  ...overrides,
});

describe("toProjects", () => {
  it("keeps own public repos with the topic, newest push first", () => {
    const projects = toProjects(
      [
        repo("old"),
        repo("New", { pushed_at: "2026-11-01T00:00:00Z" }),
        repo("untagged", { topics: ["java"] }),
        repo("forked", { fork: true }),
      ],
      "fox",
    );
    expect(projects.map(({ slug }) => slug)).toEqual(["new", "old"]);
  });

  it("hides the marker topic and empty homepages", () => {
    const [project] = toProjects([repo("mod")], "fox");
    expect(project).toMatchObject({
      name: "mod",
      repo: "fox/mod",
      topics: ["java"],
      homepage: null,
      icon: null,
      blocks: {},
      wiki: {},
    });
  });

  it("adds local details to the matching repo", () => {
    const blocks = { ru: [{ type: "text" as const, text: "hi" }] };
    const wiki = { ru: "wiki/ru.md" };
    const [project] = toProjects([repo("Mod")], "fox", { mod: { icon: "./assets/icon.png", blocks, wiki } });
    expect(project).toMatchObject({
      icon: "https://raw.githubusercontent.com/fox/Mod/HEAD/assets/icon.png",
      blocks,
      wiki,
    });
  });
});

describe("toRelease", () => {
  const release = (names: string[]) => ({
    tag_name: "v0.2.0",
    html_url: "https://github.com/fox/mod/releases/tag/v0.2.0",
    assets: names.map((name) => ({ name, browser_download_url: `https://dl/${name}` })),
  });

  it("skips sources jars", () => {
    expect(toRelease(release(["mod-sources.jar", "mod.jar"])).asset).toBe("https://dl/mod.jar");
  });

  it("has no asset without files", () => {
    expect(toRelease(release([])).asset).toBeNull();
  });
});

describe("project languages", () => {
  it("always has russian and adds languages with their own blocks", () => {
    expect(projectLangs({ blocks: {} })).toEqual(["ru"]);
    expect(projectLangs({ blocks: { en: [] } })).toEqual(["ru", "en"]);
  });

  it("keeps russian at the bare slug and chooses a language through the russian page", () => {
    expect(projectPath("mod", "ru")).toBe("/mod");
    expect(projectPath("mod", "en")).toBe("/mod/en");
    expect(projectLangChoice("mod", "en")).toBe("/mod?lang=en");
  });
});
