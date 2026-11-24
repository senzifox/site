import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Wiki } from "./Wiki";

const render = (markdown: string) =>
  renderToStaticMarkup(
    createElement(Wiki, {
      markdown,
      lang: "ru",
      source: { slug: "fox", repo: "senzifox/fox", wiki: { ru: "wiki/ru.md" }, file: "wiki/ru.md" },
    }),
  );

describe("Wiki", () => {
  it("hides #spoiler links behind a button", () => {
    const html = render("| имя |\n|-|\n| [Тайна](#spoiler) |");
    expect(html).not.toContain('href="#spoiler"');
    expect(html).toMatch(
      /<button[^>]*aria-label="спойлер, показать"[^>]*><span[^>]*aria-hidden="true">Тайна<\/span><canvas/,
    );
  });

  it("marks only the rows with a spoiler", () => {
    const html = render("| имя | условие |\n|-|-|\n| [Тайна](#spoiler) | секрет |\n| Явное | открыто |");
    expect(html).toMatch(/<tr class="[^"]+"><td><button/);
    expect(html).toContain("<tr><td>Явное</td>");
  });

  it("keeps other anchors as links", () => {
    expect(render("[Config](#config)")).toContain('href="#config"');
  });
});
