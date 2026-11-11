import { type NextRequest, NextResponse } from "next/server";
import { projectDetails } from "@/content/projects";
import { projectPath } from "@/lib/github/projects";
import { acceptedLang, DEFAULT_LANG, isLang, LANG_COOKIE, LANG_PARAM } from "@/lib/lang";

const TERMINAL_UA = /curl|wget|httpie|libcurl|lwp|python-requests|powershell/i;

const LANG_COOKIE_MAX_AGE_S = 60 * 60 * 24 * 365;

export const translatedProjects = Object.entries(projectDetails)
  .filter(([, { blocks = {} }]) => Object.keys(blocks).some((lang) => lang !== DEFAULT_LANG))
  .map(([slug]) => slug);

const uncacheable = (response: NextResponse, vary: string) => {
  response.headers.set("Vary", vary);
  response.headers.set("CDN-Cache-Control", "no-store");
  return response;
};

const terminalOrHome = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  if (TERMINAL_UA.test(request.headers.get("user-agent") ?? "")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/terminal/main" : `/terminal${pathname}`;
    return NextResponse.rewrite(url);
  }

  if (pathname !== "/") return NextResponse.redirect(new URL("/", request.url));

  return NextResponse.next();
};

const projectInLang = (request: NextRequest, slug: string) => {
  const chosen = request.nextUrl.searchParams.get(LANG_PARAM);
  if (isLang(chosen)) {
    const response = NextResponse.redirect(new URL(projectPath(slug, chosen), request.url));
    response.cookies.set(LANG_COOKIE, chosen, { path: "/", maxAge: LANG_COOKIE_MAX_AGE_S, sameSite: "lax" });
    return response;
  }

  const saved = request.cookies.get(LANG_COOKIE)?.value;
  const lang = isLang(saved) ? saved : acceptedLang(request.headers.get("accept-language"));
  if (lang && lang !== DEFAULT_LANG)
    return NextResponse.redirect(new URL(projectPath(slug, lang), request.url));

  return NextResponse.next();
};

export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.slice(1);
  if (translatedProjects.includes(slug))
    return uncacheable(projectInLang(request, slug), "Accept-Language, Cookie");
  return uncacheable(terminalOrHome(request), "User-Agent");
}

export const config = { matcher: ["/", "/short", "/full", "/about", "/foxyfriends"] };
