import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Background } from "@/components/Background/Background";
import { Footer } from "@/components/Footer/Footer";
import { HomeLink } from "@/components/HomeLink/HomeLink";
import { LangSwitch } from "@/components/LangSwitch/LangSwitch";
import { Wiki } from "@/components/Wiki/Wiki";
import { sites } from "@/content/sites";
import type { Lang } from "@/content/types";
import { getProjectsOrNone, projectDescription, projectPathIn } from "@/lib/github/projects";
import { getWikiPage, wikiLangChoice, wikiLangs, wikiPath } from "@/lib/github/wiki";
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
    title: `${project.name} ${TITLE[lang]} · ${sites[lang].header.name}`,
    description: projectDescription(project, lang),
    path: wikiPath(slug, lang),
    lang,
    languages: Object.fromEntries(wikiLangs(project).map((each) => [each, wikiPath(slug, each)])),
  });
};

export async function WikiPage({ slug, lang }: { slug: string; lang: Lang }) {
  const { project, file, markdown } = await loadWiki(slug, lang);
  const back = projectPathIn(project, lang);
  const langLinks = Object.fromEntries(wikiLangs(project).map((each) => [each, wikiLangChoice(slug, each)]));
  const { footer } = sites[lang];

  return (
    <>
      <Background />
      <main className={styles.main} lang={lang}>
        <div className={styles.bar}>
          <HomeLink href={back} label="$ cd .." />
          <LangSwitch current={lang} links={langLinks} />
        </div>
        <Wiki markdown={markdown} lang={lang} source={{ ...project, file }} />
        {footer && <Footer {...footer} lang={lang} />}
      </main>
    </>
  );
}
