import { describe, expect, it } from "vitest";
import {
  createSlugger,
  githubSlug,
  type HastNode,
  rehypeWikiSections,
  resolveWikiUrl,
  wikiPath,
} from "./wiki";

describe("githubSlug", () => {
  it("keeps cyrillic, drops punctuation, joins words with hyphens", () => {
    expect(githubSlug("Здоровье и лечение")).toBe("здоровье-и-лечение");
    expect(githubSlug("Config: server & client!")).toBe("config-server--client");
    expect(githubSlug("tamed_max_health")).toBe("tamed_max_health");
  });
});

describe("createSlugger", () => {
  it("numbers repeated headings like github", () => {
    const slug = createSlugger();
    expect(["Рецепт", "Рецепт", "Рецепт-1", "Рецепт"].map(slug)).toEqual([
      "рецепт",
      "рецепт-1",
      "рецепт-1-1",
      "рецепт-2",
    ]);
  });
});

describe("wikiPath", () => {
  it("serves the default language without a suffix", () => {
    expect(wikiPath("mod", "ru")).toBe("/mod/wiki");
    expect(wikiPath("mod", "en")).toBe("/mod/wiki/en");
  });
});

describe("resolveWikiUrl", () => {
  const source = {
    slug: "mod",
    repo: "fox/Mod",
    wiki: { ru: "wiki/ru.md", en: "wiki/en.md" },
    file: "wiki/ru.md",
  };

  it("keeps anchors and absolute urls", () => {
    expect(resolveWikiUrl("#броня", "href", source)).toBe("#броня");
    expect(resolveWikiUrl("https://modrinth.com/mod/x", "href", source)).toBe("https://modrinth.com/mod/x");
    expect(resolveWikiUrl("mailto:fox@example.com", "href", source)).toBe("mailto:fox@example.com");
  });

  it("turns links between languages into site pages", () => {
    expect(resolveWikiUrl("en.md", "href", source)).toBe("/mod/wiki/en");
    expect(resolveWikiUrl("./ru.md#броня", "href", { ...source, file: "wiki/en.md" })).toBe(
      "/mod/wiki#броня",
    );
  });

  it("points other files to github", () => {
    expect(resolveWikiUrl("../LICENSE", "href", source)).toBe("https://github.com/fox/Mod/blob/HEAD/LICENSE");
    expect(resolveWikiUrl("img/fox.png", "src", source)).toBe(
      "https://raw.githubusercontent.com/fox/Mod/HEAD/wiki/img/fox.png",
    );
  });
});

describe("rehypeWikiSections", () => {
  const element = (tagName: string, text: string): HastNode => ({
    type: "element",
    tagName,
    properties: {},
    children: [{ type: "text", value: text }],
  });
  const newline: HastNode = { type: "text", value: "\n" };

  it("wraps the intro and every h2 into sections and gives headings ids", () => {
    const tree: HastNode = {
      type: "root",
      children: [
        element("h1", "Mod"),
        newline,
        element("p", "intro"),
        newline,
        element("h2", "Режимы"),
        element("h3", "Сидеть"),
        newline,
        element("h2", "Броня"),
        element("h3", "Сидеть"),
      ],
    };
    rehypeWikiSections()(tree);
    const sections = tree.children ?? [];
    expect(sections.map(({ tagName }) => tagName)).toEqual(["section", "section", "section"]);
    const ids = sections.flatMap(({ children = [] }) =>
      children.filter(({ tagName }) => tagName?.startsWith("h")).map(({ properties }) => properties?.id),
    );
    expect(ids).toEqual(["mod", "режимы", "сидеть", "броня", "сидеть-1"]);
  });

  it("skips an empty intro", () => {
    const tree: HastNode = { type: "root", children: [newline, element("h2", "A"), element("p", "a")] };
    rehypeWikiSections()(tree);
    expect(tree.children).toHaveLength(1);
  });
});
