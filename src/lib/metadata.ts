import type { Metadata } from "next";
import { alt, size } from "@/app/opengraph-image";
import { site } from "@/content/site";

type PageMetadata = {
  title: string;
  description: string;
  path: string;
  locale?: string;
  languages?: Record<string, string>;
};

export const pageMetadata = ({
  title,
  description,
  path,
  locale = site.meta.locale,
  languages,
}: PageMetadata): Metadata => {
  const images = [{ url: "/opengraph-image", alt, ...size }];
  return {
    title,
    description,
    alternates: { canonical: path, languages },
    openGraph: {
      type: "website",
      url: path,
      siteName: site.header.name,
      title,
      description,
      locale,
      images,
    },
    twitter: { card: "summary_large_image", title, description, images },
  };
};
