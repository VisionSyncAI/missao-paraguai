import { NextRequest, NextResponse } from "next/server";
import { createStaffSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`login:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Muitas tentativas" }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  const email = String(body?.email || "").toLowerCase();
  const password = String(body?.password || "");
  const session = await createStaffSession(email, password);
  if (!session) return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  return NextResponse.json({ ok: true, role: session.role, name: session.name });
}
