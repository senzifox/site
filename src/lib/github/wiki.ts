import type { WikiLang } from "@/content/types";
import { findProject, getRawText, type Project, rawUrl } from "./projects";

export const WIKI_LANGS: readonly WikiLang[] = ["ru", "en"];

export const DEFAULT_WIKI_LANG: WikiLang = "ru";

export const wikiPath = (slug: string, lang: WikiLang) =>
  lang === DEFAULT_WIKI_LANG ? `/${slug}/wiki` : `/${slug}/wiki/${lang}`;

export const wikiLangs = ({ wiki }: Pick<Project, "wiki">) => WIKI_LANGS.filter((lang) => wiki[lang]);

export const githubSlug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, "")
    .replace(/ /g, "-");

export const createSlugger = () => {
  const occurrences = new Map<string, number>();
  return (text: string) => {
    const original = githubSlug(text);
    let result = original;
    while (occurrences.has(result)) {
      const count = (occurrences.get(original) ?? 0) + 1;
      occurrences.set(original, count);
      result = `${original}-${count}`;
    }
    occurrences.set(result, 0);
    return result;
  };
};

export type WikiSource = Pick<Project, "slug" | "repo" | "wiki"> & { file: string };

const ABSOLUTE = /^([a-z][a-z\d+.-]*:|\/\/)/i;
const REPO_ORIGIN = "https://repo.invalid";

export const resolveWikiUrl = (url: string, kind: "href" | "src", { slug, repo, wiki, file }: WikiSource) => {
  if (url.startsWith("#") || ABSOLUTE.test(url)) return url;
  const hashAt = url.indexOf("#");
  const hash = hashAt < 0 ? "" : url.slice(hashAt);
  const target = hashAt < 0 ? url : url.slice(0, hashAt);
  const path = new URL(target, `${REPO_ORIGIN}/${file}`).pathname.slice(1);
  if (kind === "src") return rawUrl(repo, path);
  const lang = WIKI_LANGS.find((candidate) => wiki[candidate] === decodeURIComponent(path));
  if (lang) return `${wikiPath(slug, lang)}${hash}`;
  return `https://github.com/${repo}/blob/HEAD/${path}${hash}`;
};

export type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

const HEADINGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

const textOf = (node: HastNode): string =>
  node.type === "text" ? (node.value ?? "") : (node.children ?? []).map(textOf).join("");

const section = (children: HastNode[]): HastNode => ({
  type: "element",
  tagName: "section",
  properties: {},
  children,
});

export const rehypeWikiSections = () => (tree: HastNode) => {
  const slug = createSlugger();
  const sections: HastNode[][] = [[]];
  for (const node of tree.children ?? []) {
    if (node.tagName && HEADINGS.has(node.tagName)) {
      node.properties = { ...node.properties, id: slug(textOf(node)) };
    }
    if (node.tagName === "h2") sections.push([]);
    sections[sections.length - 1].push(node);
  }
  tree.children = sections.filter((nodes) => nodes.some(({ type }) => type === "element")).map(section);
};

export type WikiPage = { project: Project; lang: WikiLang; file: string; markdown: string };

export const getWikiPage = async (slug: string, lang: WikiLang): Promise<WikiPage | null> => {
  const project = await findProject(slug);
  const file = project?.wiki[lang];
  if (!project || !file) return null;
  const markdown = await getRawText(project.repo, file);
  return markdown === null ? null : { project, lang, file, markdown };
};
