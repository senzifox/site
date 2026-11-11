import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Background } from "@/components/Background/Background";
import { Footer } from "@/components/Footer/Footer";
import { HomeLink } from "@/components/HomeLink/HomeLink";
import { LangSwitch } from "@/components/LangSwitch/LangSwitch";
import { Wiki } from "@/components/Wiki/Wiki";
import { site } from "@/content/site";
import type { Lang } from "@/content/types";
import { getProjectsOrNone, projectLangs, projectPath } from "@/lib/github/projects";
import { getWikiPage, wikiLangs, wikiPath } from "@/lib/github/wiki";
import { DEFAULT_LANG, LOCALES } from "@/lib/lang";
import { pageMetadata } from "@/lib/metadata";
import styles from "../page.module.css";

const TITLE: Record<Lang, string> = { ru: "вики", en: "wiki" };

export type WikiProps = { params: Promise<{ slug: string }> };

const loadWiki = cache(async (slug: string, lang: Lang) => {
  const page = await getWikiPage(slug, lang);
  if (!page) notFound();
  return page;
});

export const wikiStaticParams = async (lang: Lang) =>
  (await getProjectsOrNone()).filter(({ wiki }) => wiki[lang]).map(({ slug }) => ({ slug }));

export const wikiMetadata = async (slug: string, lang: Lang): Promise<Metadata> => {
  const { project } = await loadWiki(slug, lang);
  return pageMetadata({
    title: `${project.name} ${TITLE[lang]} · ${site.header.name}`,
    description: project.description,
    path: wikiPath(slug, lang),
    locale: LOCALES[lang],
    languages: Object.fromEntries(wikiLangs(project).map((each) => [each, wikiPath(slug, each)])),
  });
};

export async function WikiPage({ slug, lang }: { slug: string; lang: Lang }) {
  const { project, file, markdown } = await loadWiki(slug, lang);
  const back = projectPath(slug, projectLangs(project).includes(lang) ? lang : DEFAULT_LANG);
  const langLinks = Object.fromEntries(wikiLangs(project).map((each) => [each, wikiPath(slug, each)]));

  return (
    <>
      <Background />
      <main className={styles.main}>
        <div className={styles.bar}>
          <HomeLink href={back} label="$ cd .." />
          <LangSwitch current={lang} links={langLinks} />
        </div>
        <Wiki markdown={markdown} lang={lang} source={{ ...project, file }} />
        {site.footer && <Footer {...site.footer} />}
      </main>
    </>
  );
}
