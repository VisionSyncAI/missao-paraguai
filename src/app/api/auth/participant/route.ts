import { NextRequest, NextResponse } from "next/server";
import { createParticipantSession } from "@/lib/participantAuth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  if (!token) return NextResponse.json({ error: "TOKEN_REQUIRED" }, { status: 400 });
  const session = await createParticipantSession(token);
  if (!session) return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 401 });
  return NextResponse.json({ ok: true });
}
