import type { MetadataRoute } from "next";
import { sites } from "@/content/sites";
import { theme } from "@/content/theme";
import type { Lang } from "@/content/types";
import { homePath, INTL_LOCALES, langPath } from "@/lib/lang";

export const manifestPath = (lang: Lang) => `${langPath("", lang)}/manifest.webmanifest`;

export const siteManifest = (lang: Lang): MetadataRoute.Manifest => {
  const { meta, header } = sites[lang];
  return {
    name: meta.title,
    short_name: header.name,
    description: meta.description,
    lang: INTL_LOCALES[lang],
    start_url: homePath(lang),
    display: "standalone",
    background_color: theme.background,
    theme_color: theme.background,
    icons: [
      { src: "/icon.png", sizes: "192x192", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
};
