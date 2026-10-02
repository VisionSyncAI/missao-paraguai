import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readLeadVerifyToken } from "@/lib/leadVerify";
import { setLeadSession } from "@/lib/leadSession";

// Relative Location: request.nextUrl reflects the server's internal host behind a proxy,
// so an absolute redirect could send the browser to a host that does not hold the cookie.
function redirectTo(location: string) {
  return new NextResponse(null, { status: 303, headers: { Location: location } });
}

/** Confirmation link from the "pré-inscrição já existe" e-mail: the only way to resume an existing lead. */
export async function GET(request: NextRequest) {
  const leadId = await readLeadVerifyToken(request.nextUrl.searchParams.get("t"));
  const lead = leadId ? await prisma.lead.findUnique({ where: { id: leadId }, select: { id: true } }) : null;
  if (!lead) return redirectTo("/interesse?link=invalido");
  await setLeadSession(lead.id);
  return redirectTo("/interesse?continuar=1");
}
