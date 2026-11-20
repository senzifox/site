import type { Metadata } from "next";
import { alt, size } from "@/app/opengraph-image";
import { sites } from "@/content/sites";
import type { Lang } from "@/content/types";
import { LOCALES } from "@/lib/lang";

type PageMetadata = {
  title: string;
  description: string;
  path: string;
  lang: Lang;
  languages?: Record<string, string>;
};

export const pageMetadata = ({ title, description, path, lang, languages }: PageMetadata): Metadata => {
  const images = [{ url: "/opengraph-image", alt, ...size }];
  return {
    title,
    description,
    alternates: { canonical: path, languages },
    openGraph: {
      type: "website",
      url: path,
      siteName: sites[lang].header.name,
      title,
      description,
      locale: LOCALES[lang],
      images,
    },
    twitter: { card: "summary_large_image", title, description, images },
  };
};
