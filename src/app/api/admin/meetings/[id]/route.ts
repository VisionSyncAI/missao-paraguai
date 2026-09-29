import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { can, getStaffSession } from "@/lib/auth";
import { MEETING_STATUSES } from "@/modules/leads/status";

const schema = z.object({
  status: z.enum(MEETING_STATUSES),
  notes: z.string().max(2000).optional(),
  outcome: z.string().max(2000).optional(),
});

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  if (!can(session.role, "meeting:update")) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Validação falhou" }, { status: 400 });
  const meeting = await prisma.meeting.findUnique({ where: { id }, include: { lead: true } });
  if (!meeting) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (session.role === "CONSULTANT" && meeting.consultantId !== session.consultantId) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const updated = await prisma.meeting.update({
    where: { id },
    data: { status: parsed.data.status, notes: parsed.data.notes, outcome: parsed.data.outcome },
  });

  if (parsed.data.status === "CANCELLED") {
    await prisma.slotLock.deleteMany({ where: { id: `${meeting.consultantId}:${meeting.scheduledAt.toISOString()}` } });
  }
  if (parsed.data.status === "COMPLETED") {
    await prisma.lead.update({
      where: { id: meeting.leadId },
      data: { status: "MEETING_COMPLETED" },
    });
    await prisma.activity.create({
      data: {
        leadId: meeting.leadId,
        type: "MEETING_COMPLETED",
        body: "Reunião marcada como realizada.",
        actorId: session.userId,
      },
    });
  }
  if (parsed.data.status === "NO_SHOW") {
    await prisma.activity.create({
      data: { leadId: meeting.leadId, type: "MEETING_COMPLETED", body: "No-show registrado.", actorId: session.userId },
    });
  }
  return NextResponse.json({ ok: true, status: updated.status });
}
