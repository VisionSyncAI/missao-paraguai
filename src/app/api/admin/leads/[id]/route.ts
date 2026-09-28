import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/auth";
import { staffLeadDTO } from "@/modules/leads/service";
import { LEAD_STATUSES, canTransitionLead } from "@/modules/leads/status";
import { createRegistrationFromLead } from "@/modules/registrations/service";

const patchSchema = z.object({
  status: z.enum(LEAD_STATUSES).optional(),
  notes: z.string().max(4000).optional(),
  nextAction: z.string().max(240).optional(),
  consultantId: z.string().optional(),
  lostReason: z.string().max(240).optional(),
});

export async function GET(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const { id } = await ctx.params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      company: true,
      consultant: true,
      meetings: { orderBy: { scheduledAt: "desc" } },
      downloads: { orderBy: { downloadedAt: "desc" } },
      companions: true,
    },
  });
  if (!lead) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (session.role === "CONSULTANT" && lead.consultantId !== session.consultantId) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  return NextResponse.json({
    lead: {
      ...staffLeadDTO(lead, session.role),
      companions: lead.companions.map((c) => ({
        name: c.fullName,
        relationType: c.relationType,
      })),
    },
  });
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  if (!["ADMIN", "COMMERCIAL", "CONSULTANT"].includes(session.role)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Validação falhou" }, { status: 400 });

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (session.role === "CONSULTANT" && lead.consultantId !== session.consultantId) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  if (parsed.data.consultantId && session.role === "CONSULTANT") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  if (parsed.data.status && !canTransitionLead(lead.status, parsed.data.status)) {
    return NextResponse.json({ error: "Transição de status inválida" }, { status: 409 });
  }

  const updated = await prisma.lead.update({
    where: { id },
    data: {
      status: parsed.data.status,
      notes: parsed.data.notes,
      nextAction: parsed.data.nextAction,
      consultantId: parsed.data.consultantId,
      lostReason: parsed.data.lostReason,
    },
  });
  if (parsed.data.status && parsed.data.status !== lead.status) {
    await prisma.activity.create({
      data: {
        leadId: id,
        type: "STATUS_CHANGED",
        body: `${lead.status} → ${parsed.data.status}`,
        actorId: session.userId,
      },
    });
  }
  if (updated.status === "WON") {
    await createRegistrationFromLead(id, session.userId);
  }
  return NextResponse.json({ ok: true, status: updated.status });
}
