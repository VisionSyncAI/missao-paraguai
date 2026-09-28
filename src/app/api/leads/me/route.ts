import { NextRequest, NextResponse } from "next/server";
import { findLeadByToken, publicLeadDTO } from "@/modules/leads/service";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token ausente" }, { status: 400 });
  const lead = await findLeadByToken(token);
  if (!lead) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(publicLeadDTO(lead));
}
