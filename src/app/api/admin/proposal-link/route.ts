import { NextResponse } from "next/server";
import { can, getStaffSession } from "@/lib/auth";

export async function GET() {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  if (!can(session.role, "lead:read")) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  return NextResponse.json({ path: "/apresentacao" });
}
