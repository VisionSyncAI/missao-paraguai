import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isStaffRole } from "@/lib/rbac";
import { participantSecret, staffSecret, verifySession } from "@/lib/signedSession";

function deny(request: NextRequest, loginPath: string) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const url = request.nextUrl.clone();
  url.pathname = loginPath;
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login" || pathname === "/api/auth/login") return NextResponse.next();

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const session = await verifySession(request.cookies.get("ip_staff")?.value, staffSecret(), "staff");
    if (!session || !isStaffRole(session.role)) return deny(request, "/admin/login");
    return NextResponse.next();
  }

  if (pathname.startsWith("/participante") || pathname.startsWith("/api/participant")) {
    const session = await verifySession(request.cookies.get("ip_participant")?.value, participantSecret(), "participant");
    if (!session) return deny(request, "/login");
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/participante", "/participante/:path*", "/api/participant/:path*"],
};
