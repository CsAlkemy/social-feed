import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authed = request.cookies.has("authed");
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();

  if (pathname === "/") {
    url.pathname = authed ? "/feed" : "/auth/login";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/feed") && !authed) {
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/auth") && authed) {
    url.pathname = "/feed";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/feed/:path*", "/auth/:path*"],
};
