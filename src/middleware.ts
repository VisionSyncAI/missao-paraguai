import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login" || pathname === "/api/auth/login") return NextResponse.next();
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const session = request.cookies.get("ip_staff")?.value;
    if (!session) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
      }
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }
  if (pathname.startsWith("/participante") || pathname.startsWith("/api/participant")) {
    const session = request.cookies.get("ip_participant")?.value;
    if (!session) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
      }
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/participante", "/participante/:path*", "/api/participant/:path*"],
};
