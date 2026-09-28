import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertPermission, getStaffSession } from "@/lib/auth";
import { PROPOSAL_STATUSES, transitionProposal } from "@/modules/proposals/service";
import { createRegistrationFromLead } from "@/modules/registrations/service";

export async function GET(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getStaffSession();
  try {
    assertPermission(session, "proposal:read");
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: session ? 403 : 401 });
  }
  const { id } = await ctx.params;
  const proposal = await prisma.proposal.findUnique({ where: { id }, include: { items: true, versions: true, lead: true } });
  if (!proposal) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ proposal });
}

const schema = z.object({ status: z.enum(PROPOSAL_STATUSES) });

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getStaffSession();
  try {
    assertPermission(session, "proposal:write");
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: session ? 403 : 401 });
  }
  const { id } = await ctx.params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Validação falhou" }, { status: 400 });
  const updated = await transitionProposal(id, parsed.data.status, session!.userId);
  if (updated.status === "ACCEPTED") {
    const proposal = await prisma.proposal.findUnique({ where: { id } });
    if (proposal) await createRegistrationFromLead(proposal.leadId, session!.userId);
  }
  return NextResponse.json({ ok: true, proposal: updated });
}
