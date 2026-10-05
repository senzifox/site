import { site } from "@/content/site";

export function personJsonLd() {
  const { name, socials } = site.header;
  const { url, description } = site.meta;

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
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
