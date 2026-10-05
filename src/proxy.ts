import { type NextRequest, NextResponse } from "next/server";

const TERMINAL_UA = /curl|wget|httpie|libcurl|lwp|python-requests|powershell/i;

const VARIANTS: Record<string, string> = {
  "/": "main",
  "/short": "short",
  "/full": "full",
  "/about": "about",
};

const varyByAgent = (response: NextResponse) => {
  response.headers.set("Vary", "User-Agent");
  response.headers.set("CDN-Cache-Control", "no-store");
  return response;
};

const route = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  if (TERMINAL_UA.test(request.headers.get("user-agent") ?? "")) {
    const url = request.nextUrl.clone();
    url.pathname = `/terminal/${VARIANTS[pathname]}`;
    return NextResponse.rewrite(url);
  }

  if (pathname !== "/") return NextResponse.redirect(new URL("/", request.url));

  return NextResponse.next();
};

export function proxy(request: NextRequest) {
  return varyByAgent(route(request));
}

export const config = { matcher: ["/", "/short", "/full", "/about"] };
