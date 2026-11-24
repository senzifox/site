import Markdown, { type Components, defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card } from "@/components/Card/Card";
import type { Lang } from "@/content/types";
import {
  hasSpoiler,
  rehypeWikiSections,
  resolveWikiUrl,
  SPOILER_HREF,
  type WikiSource,
} from "@/lib/github/wiki";
import { Spoiler, SpoilerRow } from "./Spoiler";
import styles from "./Wiki.module.css";

const SPOILER_LABEL: Record<Lang, string> = { ru: "спойлер, показать", en: "spoiler, reveal" };

const isExternal = (href?: string) => /^https?:/.test(href ?? "");

const components = (lang: Lang): Components => ({
  section: ({ node: _node, className: _className, ...props }) => (
    <Card className={styles.section} {...props} />
  ),
  a: ({ node: _node, href, ...props }) =>
    href === SPOILER_HREF ? (
      <Spoiler label={SPOILER_LABEL[lang]}>{props.children}</Spoiler>
    ) : isExternal(href) ? (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
    ) : (
      <a href={href} {...props} />
    ),
  tr: ({ node, ...props }) => (node && hasSpoiler(node) ? <SpoilerRow {...props} /> : <tr {...props} />),
  table: ({ node: _node, ...props }) => (
    <div className={styles.table}>
      <table {...props} />
    </div>
  ),
});

type Props = { markdown: string; lang: Lang; source: WikiSource };

export function Wiki({ markdown, lang, source }: Props) {
  return (
    <div className={styles.wiki} lang={lang}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeWikiSections]}
        components={components(lang)}
        urlTransform={(url, key) =>
          defaultUrlTransform(resolveWikiUrl(url, key === "src" ? "src" : "href", source))
        }
      >
        {markdown}
      </Markdown>
    </div>
  );
}
