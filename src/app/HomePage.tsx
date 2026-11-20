import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { AVATAR_SIZE, Avatar } from "@/components/Avatar/Avatar";
import { Background } from "@/components/Background/Background";
import { Blocks } from "@/components/blocks/Blocks";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { LangSwitch } from "@/components/LangSwitch/LangSwitch";
import { SocialLinks } from "@/components/SocialLinks/SocialLinks";
import { sites } from "@/content/sites";
import type { Lang } from "@/content/types";
import { personJsonLd } from "@/lib/jsonLd";
import { DEFAULT_LANG, homePath, LANGS, LOCALES, langChoice } from "@/lib/lang";
import { manifestPath } from "@/lib/manifest";
import { headerCssVars } from "@/lib/scroll";
import styles from "./page.module.css";

const homeLanguages = Object.fromEntries(LANGS.map((lang) => [lang, homePath(lang)]));

const homeLangLinks = Object.fromEntries(
  LANGS.map((lang) => [lang, langChoice(homePath(DEFAULT_LANG), lang)]),
);

export const homeMetadata = (lang: Lang): Metadata => {
  const { meta, header } = sites[lang];
  const { title, description, keywords } = meta;
  const path = homePath(lang);
  return {
    title,
    description,
    keywords,
    applicationName: header.name,
    authors: [{ name: header.name, url: meta.url }],
    creator: header.name,
    manifest: manifestPath(lang),
    alternates: { canonical: path, languages: homeLanguages },
    openGraph: {
      type: "website",
      url: path,
      siteName: header.name,
      title,
      description,
      locale: LOCALES[lang],
    },
    twitter: { card: "summary_large_image", title, description },
  };
};

export function HomePage({ lang }: { lang: Lang }) {
  const { header, blocks, footer } = sites[lang];

  return (
    <div style={headerCssVars as CSSProperties} lang={lang}>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static jsonld built from site config
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(lang)) }}
      />
      <Background />
      <div className={styles.corner}>
        <LangSwitch current={lang} links={homeLangLinks} />
      </div>
      <Header
        avatar={<Avatar alt={header.name} />}
        avatarSize={AVATAR_SIZE}
        name={header.name}
        lineAbove={header.lineAbove}
        lineBelow={header.lineBelow}
        socials={<SocialLinks items={header.socials} />}
      />
      <main className={styles.main}>
        <Blocks blocks={blocks} lang={lang} />
        {footer && <Footer {...footer} lang={lang} />}
      </main>
    </div>
  );
}
