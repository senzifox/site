import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Background } from "@/components/Background/Background";
import { Footer } from "@/components/Footer/Footer";
import { HomeLink } from "@/components/HomeLink/HomeLink";
import { Wiki } from "@/components/Wiki/Wiki";
import { site } from "@/content/site";
import type { WikiLang } from "@/content/types";
import { getProjectsOrNone } from "@/lib/github/projects";
import { getWikiPage, wikiLangs, wikiPath } from "@/lib/github/wiki";
import { pageMetadata } from "@/lib/metadata";
import styles from "../page.module.css";

const TITLE: Record<WikiLang, string> = { ru: "вики", en: "wiki" };
const LOCALE: Record<WikiLang, string> = { ru: "ru_RU", en: "en_US" };

export type WikiProps = { params: Promise<{ slug: string }> };

const loadWiki = cache(async (slug: string, lang: WikiLang) => {
  const page = await getWikiPage(slug, lang);
  if (!page) notFound();
  return page;
});

export const wikiStaticParams = async (lang: WikiLang) =>
  (await getProjectsOrNone()).filter(({ wiki }) => wiki[lang]).map(({ slug }) => ({ slug }));

export const wikiMetadata = async (slug: string, lang: WikiLang): Promise<Metadata> => {
  const { project } = await loadWiki(slug, lang);
  return pageMetadata({
    title: `${project.name} ${TITLE[lang]} · ${site.header.name}`,
    description: project.description,
    path: wikiPath(slug, lang),
    locale: LOCALE[lang],
    languages: Object.fromEntries(wikiLangs(project).map((each) => [each, wikiPath(slug, each)])),
  });
};

export async function WikiPage({ slug, lang }: { slug: string; lang: WikiLang }) {
  const { project, file, markdown } = await loadWiki(slug, lang);

  return (
    <>
      <Background />
      <main className={styles.main}>
        <HomeLink className={styles.home} href={`/${slug}`} label="$ cd .." />
        <Wiki markdown={markdown} lang={lang} source={{ ...project, file }} />
        {site.footer && <Footer {...site.footer} />}
      </main>
    </>
  );
}
