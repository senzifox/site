import { type NextRequest, NextResponse } from "next/server";

const TERMINAL_UA = /curl|wget|httpie|libcurl|lwp|python-requests|powershell/i;

const uncacheablePerAgent = (response: NextResponse) => {
  response.headers.set("Vary", "User-Agent");
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

export function proxy(request: NextRequest) {
  return uncacheablePerAgent(terminalOrHome(request));
}

export const config = { matcher: ["/", "/short", "/full", "/about"] };
