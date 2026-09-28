import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertPermission, getStaffSession } from "@/lib/auth";
import { createProposal } from "@/modules/proposals/service";

export async function GET() {
  const session = await getStaffSession();
  try {
    assertPermission(session, "proposal:read");
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: session ? 403 : 401 });
  }
  const proposals = await prisma.proposal.findMany({
    include: { lead: true, items: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({
    proposals: proposals.map((p) => ({
      id: p.id,
      status: p.status,
      leadName: p.lead.fullName,
      leadId: p.leadId,
      createdAt: p.createdAt,
      items: p.items,
    })),
  });
}

const schema = z.object({
  leadId: z.string(),
  productCode: z.string(),
  addonCodes: z.array(z.string()).optional(),
  notes: z.string().max(4000).optional(),
  validUntil: z.string().optional(),
  discountBps: z.number().int().min(0).max(2000).optional(),
});

export async function POST(request: NextRequest) {
  const session = await getStaffSession();
  try {
    assertPermission(session, "proposal:write");
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: session ? 403 : 401 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Validação falhou" }, { status: 400 });
  try {
    const proposal = await createProposal({ ...parsed.data, ownerId: session!.userId });
    return NextResponse.json({ ok: true, proposal });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    const status = message === "BLOCKED_BY_BUSINESS_DECISION" ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
