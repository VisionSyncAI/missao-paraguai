import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/auth";

export async function GET(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const { id } = await ctx.params;
  const lead = await prisma.lead.findUnique({ where: { id }, select: { consultantId: true } });
  if (!lead) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (session.role === "CONSULTANT" && lead.consultantId !== session.consultantId) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const activities = await prisma.activity.findMany({
    where: { leadId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({
    activities: activities.map((a) => ({
      id: a.id,
      type: a.type,
      body: a.body,
      createdAt: a.createdAt,
    })),
  });
}
