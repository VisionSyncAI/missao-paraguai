import { NextRequest, NextResponse } from "next/server";
import { resolvePublicLead } from "@/lib/leadAccess";
import { publicLeadDTO } from "@/modules/leads/service";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const lead = await resolvePublicLead(token);
  if (!lead) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(publicLeadDTO(lead));
}
