import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { alt, size } from "@/app/opengraph-image";
import { Background } from "@/components/Background/Background";
import { Blocks } from "@/components/blocks/Blocks";
import { Card } from "@/components/Card/Card";
import { Chips } from "@/components/Chips/Chips";
import { Footer } from "@/components/Footer/Footer";
import { HomeLink } from "@/components/HomeLink/HomeLink";
import { Icon } from "@/components/Icon/Icon";
import { ProjectIcon } from "@/components/ProjectIcon/ProjectIcon";
import { site } from "@/content/site";
import { getProjectPage, getProjectsOrNone } from "@/lib/github/projects";
import styles from "./page.module.css";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 900;

export const generateStaticParams = async () => (await getProjectsOrNone()).map(({ slug }) => ({ slug }));

const loadProject = cache(async (slug: string) => {
  const project = await getProjectPage(slug);
  if (!project) notFound();
  return project;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, name, description } = await loadProject((await params).slug);
  const title = `${name} · ${site.header.name}`;
  const path = `/${slug}`;
  const images = [{ url: "/opengraph-image", alt, ...size }];

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      siteName: site.header.name,
      title,
      description,
      locale: site.meta.locale,
      images,
    },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

const isExternal = (url: string) => {
  try {
    return new URL(url).host !== new URL(site.meta.url).host;
  } catch {
    return false;
  }
};

export default async function ProjectPage({ params }: Props) {
  const { slug, name, description, topics, url, homepage, icon, blocks, release } = await loadProject(
    (await params).slug,
  );

  return (
    <>
      <Background />
      <main className={styles.main}>
        <HomeLink className={styles.home} />
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
                скачать {release.tag}
              </a>
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
                aria-label="сайт"
              >
                <Icon name="openInNew" size={20} />
              </a>
            )}
          </div>
        </Card>
        <Blocks blocks={blocks} />
        {site.footer && <Footer {...site.footer} />}
      </main>
    </>
  );
}
