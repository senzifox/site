import type { Lang } from "@/content/types";

export const LANGS: readonly Lang[] = ["ru", "en"];

export const DEFAULT_LANG: Lang = "ru";

export const LANG_PARAM = "lang";

export const LANG_COOKIE = "lang";

export const LOCALES: Record<Lang, string> = { ru: "ru_RU", en: "en_US" };

export const isLang = (value: unknown): value is Lang => LANGS.includes(value as Lang);

export const langPath = (base: string, lang: Lang) => (lang === DEFAULT_LANG ? base : `${base}/${lang}`);

export const acceptedLang = (header: string | null): Lang | null => {
  if (!header?.trim()) return null;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag = "", ...params] = part.split(";").map((piece) => piece.trim());
      const quality = params.find((param) => param.startsWith("q="));
      return { lang: tag.toLowerCase().split("-")[0], q: quality ? Number(quality.slice(2)) : 1 };
    })
    .filter(({ q }) => q > 0)
    .sort((a, b) => b.q - a.q);
  return ranked.map(({ lang }) => lang).find(isLang) ?? "en";
};
