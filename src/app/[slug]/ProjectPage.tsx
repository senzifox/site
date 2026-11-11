import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Background } from "@/components/Background/Background";
import { Blocks } from "@/components/blocks/Blocks";
import { Card } from "@/components/Card/Card";
import { Chips } from "@/components/Chips/Chips";
import { Footer } from "@/components/Footer/Footer";
import { HomeLink } from "@/components/HomeLink/HomeLink";
import { Icon } from "@/components/Icon/Icon";
import { LangSwitch } from "@/components/LangSwitch/LangSwitch";
import { ProjectIcon } from "@/components/ProjectIcon/ProjectIcon";
import { site } from "@/content/site";
import type { Lang } from "@/content/types";
import {
  getProjectPage,
  getProjectsOrNone,
  projectLangChoice,
  projectLangs,
  projectPath,
} from "@/lib/github/projects";
import { wikiLangs, wikiPath } from "@/lib/github/wiki";
import { LOCALES } from "@/lib/lang";
import { pageMetadata } from "@/lib/metadata";
import styles from "./page.module.css";

const TEXT: Record<Lang, { download: string; wiki: string; website: string }> = {
  ru: { download: "скачать", wiki: "вики", website: "сайт" },
  en: { download: "download", wiki: "wiki", website: "website" },
};

export type ProjectProps = { params: Promise<{ slug: string }> };

const loadProject = cache(async (slug: string, lang: Lang) => {
  const project = await getProjectPage(slug);
  if (!project || !projectLangs(project).includes(lang)) notFound();
  return project;
});

export const projectStaticParams = async (lang: Lang) =>
  (await getProjectsOrNone())
    .filter((project) => projectLangs(project).includes(lang))
    .map(({ slug }) => ({ slug }));

export const projectMetadata = async (slug: string, lang: Lang): Promise<Metadata> => {
  const project = await loadProject(slug, lang);
  return pageMetadata({
    title: `${project.name} · ${site.header.name}`,
    description: project.description,
    path: projectPath(project.slug, lang),
    locale: LOCALES[lang],
    languages: Object.fromEntries(
      projectLangs(project).map((each) => [each, projectPath(project.slug, each)]),
    ),
  });
};

const isExternal = (url: string) => {
  try {
    return new URL(url).host !== new URL(site.meta.url).host;
  } catch {
    return false;
  }
};

export async function ProjectPage({ slug, lang }: { slug: string; lang: Lang }) {
  const project = await loadProject(slug, lang);
  const { name, description, topics, url, homepage, icon, blocks, release } = project;
  const text = TEXT[lang];
  const wikis = wikiLangs(project);
  const wikiLang = wikis.includes(lang) ? lang : wikis[0];
  const langLinks = Object.fromEntries(
    projectLangs(project).map((each) => [each, projectLangChoice(slug, each)]),
  );

  return (
    <>
      <Background />
      <main className={styles.main} lang={lang}>
        <div className={styles.bar}>
          <HomeLink />
          <LangSwitch current={lang} links={langLinks} />
        </div>
        <Card className={styles.hero}>
          <div className={styles.top}>
            <ProjectIcon name={name} src={icon} />
            <div className={styles.titles}>
              <h1 className={styles.name}>{name}</h1>
              {description && <p className={styles.summary}>{description}</p>}
            </div>
          </div>
          {topics.length > 0 && <Chips items={topics} />}
          <div className={styles.actions}>
            {release?.asset && (
              <a className={styles.download} href={`/${slug}/download`}>
                <Icon name="download" size={20} />
                {text.download} {release.tag}
              </a>
            )}
            {wikiLang && (
              <Link className={styles.action} href={wikiPath(slug, wikiLang)} aria-label={text.wiki}>
                <Icon name="wiki" size={20} />
              </Link>
            )}
            <a
              className={styles.action}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="github"
            >
              <Icon name="github" size={20} />
            </a>
            {homepage && isExternal(homepage) && (
              <a
                className={styles.action}
                href={homepage}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={text.website}
              >
                <Icon name="openInNew" size={20} />
              </a>
            )}
          </div>
        </Card>
        <Blocks blocks={blocks[lang] ?? []} />
        {site.footer && <Footer {...site.footer} />}
      </main>
    </>
  );
}
