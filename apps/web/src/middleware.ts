import { NextResponse, type NextRequest } from "next/server";

import { isProtectedRoute } from "@/lib/protected-routes";

export function middleware(request: NextRequest) {
  const authed = request.cookies.has("authed");
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();

  if (pathname === "/") {
    url.pathname = authed ? "/feed" : "/auth/login";
    return NextResponse.redirect(url);
  }

  if (isProtectedRoute(pathname) && !authed) {
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
  matcher: [
    "/",
    "/feed/:path*",
    "/posts/:path*",
    "/members/:path*",
    "/events/:path*",
    "/saved/:path*",
    "/profile/:path*",
    "/auth/:path*",
  ],
};
