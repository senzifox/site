import Markdown, { type Components, defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card } from "@/components/Card/Card";
import type { WikiLang } from "@/content/types";
import { rehypeWikiSections, resolveWikiUrl, type WikiSource } from "@/lib/github/wiki";
import styles from "./Wiki.module.css";

const isExternal = (href?: string) => /^https?:/.test(href ?? "");

const components: Components = {
  section: ({ node: _node, className: _className, ...props }) => (
    <Card className={styles.section} {...props} />
  ),
  a: ({ node: _node, href, ...props }) =>
    isExternal(href) ? (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
    ) : (
      <a href={href} {...props} />
    ),
  table: ({ node: _node, ...props }) => (
    <div className={styles.table}>
      <table {...props} />
    </div>
  ),
};

type Props = { markdown: string; lang: WikiLang; source: WikiSource };

export function Wiki({ markdown, lang, source }: Props) {
  return (
    <div className={styles.wiki} lang={lang}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeWikiSections]}
        components={components}
        urlTransform={(url, key) =>
          defaultUrlTransform(resolveWikiUrl(url, key === "src" ? "src" : "href", source))
        }
      >
        {markdown}
      </Markdown>
    </div>
  );
}
