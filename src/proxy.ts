import { type NextRequest, NextResponse } from "next/server";
import { projectDetails } from "@/content/projects";
import type { Lang } from "@/content/types";
import { projectPath } from "@/lib/github/projects";
import { wikiPath } from "@/lib/github/wiki";
import { DEFAULT_LANG, homePath, isLang, LANG_COOKIE, LANG_PARAM, LANGS, preferredLang } from "@/lib/lang";

const TERMINAL_UA = /curl|wget|httpie|libcurl|lwp|python-requests|powershell/i;

const LANG_COOKIE_MAX_AGE_S = 60 * 60 * 24 * 365;

type TranslatedPage = { langs: Lang[]; pathIn: (lang: Lang) => string };

const withDefault = (langs: Partial<Record<Lang, unknown>>) =>
  LANGS.filter((lang) => lang === DEFAULT_LANG || langs[lang]);

export const translatedPages: Record<string, TranslatedPage> = Object.fromEntries(
  Object.entries(projectDetails)
    .flatMap(([slug, { blocks = {}, wiki = {} }]): [string, TranslatedPage][] => [
      [`/${slug}`, { langs: withDefault(blocks), pathIn: (lang) => projectPath(slug, lang) }],
      [
        `/${slug}/wiki`,
        {
          langs: wiki[DEFAULT_LANG] ? LANGS.filter((lang) => wiki[lang]) : [],
          pathIn: (lang) => wikiPath(slug, lang),
        },
      ],
    ])
    .filter(([, { langs }]) => langs.length > 1),
);

const uncacheable = (response: NextResponse, vary: string) => {
  response.headers.set("Vary", vary);
  response.headers.set("CDN-Cache-Control", "no-store");
  return response;
};

const home: TranslatedPage = { langs: [...LANGS], pathIn: homePath };

const isTerminal = (request: NextRequest) => TERMINAL_UA.test(request.headers.get("user-agent") ?? "");

const toTerminal = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? "/terminal/main" : `/terminal${pathname}`;
  return NextResponse.rewrite(url);
};

const redirectKeepingQuery = (request: NextRequest, path: string) => {
  const url = new URL(path, request.url);
  url.search = request.nextUrl.search;
  url.searchParams.delete(LANG_PARAM);
  return NextResponse.redirect(url);
};

const pageInLang = (request: NextRequest, { langs, pathIn }: TranslatedPage) => {
  const chosen = request.nextUrl.searchParams.get(LANG_PARAM);
  if (isLang(chosen) && langs.includes(chosen)) {
    const response = redirectKeepingQuery(request, pathIn(chosen));
    response.cookies.set(LANG_COOKIE, chosen, { path: "/", maxAge: LANG_COOKIE_MAX_AGE_S, sameSite: "lax" });
    return response;
  }

  const lang = preferredLang(request.cookies.get(LANG_COOKIE)?.value, request.headers.get("accept-language"));
  if (lang && lang !== DEFAULT_LANG && langs.includes(lang))
    return redirectKeepingQuery(request, pathIn(lang));

  return NextResponse.next();
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/")
    return uncacheable(
      isTerminal(request) ? toTerminal(request) : pageInLang(request, home),
      "User-Agent, Accept-Language, Cookie",
    );

  const page = translatedPages[pathname];
  if (page) return uncacheable(pageInLang(request, page), "Accept-Language, Cookie");

  return uncacheable(
    isTerminal(request) ? toTerminal(request) : NextResponse.redirect(new URL("/", request.url)),
    "User-Agent",
  );
}

export const config = {
  matcher: ["/", "/short", "/full", "/about", "/foxyfriends", "/foxyfriends/wiki"],
};
