import { sites } from "@/content/sites";
import type { Lang } from "@/content/types";
import { homePath } from "@/lib/lang";

export function personJsonLd(lang: Lang) {
  const { name, socials } = sites[lang].header;
  const { url, description } = sites[lang].meta;

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    inLanguage: lang,
    url: new URL(homePath(lang), url).toString(),
    mainEntity: {
      "@type": "Person",
      name,
      url,
      description,
      image: new URL("/avatar.webp", url).toString(),
      sameAs: socials.flatMap((social) => ("href" in social ? [social.href] : [])),
    },
  };
}
