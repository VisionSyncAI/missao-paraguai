import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { can, getStaffSession } from "@/lib/auth";
import { ANALYTICS_DAYS, shapeSiteAnalytics } from "@/lib/siteAnalytics";

export async function GET() {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  if (!can(session.role, "lead:read")) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const scoped = session.role === "CONSULTANT" && session.consultantId ? { consultantId: session.consultantId } : {};
  const [total, byStatus, downloads, meetings] = await Promise.all([
    prisma.lead.count({ where: scoped }),
    prisma.lead.groupBy({ by: ["status"], where: scoped, _count: { _all: true } }),
    prisma.presentationDownload.count({
      where: session.consultantId && session.role === "CONSULTANT" ? { lead: { consultantId: session.consultantId } } : undefined,
    }),
    prisma.meeting.groupBy({
      by: ["status"],
      where: session.role === "CONSULTANT" && session.consultantId ? { consultantId: session.consultantId } : undefined,
      _count: { _all: true },
    }),
  ]);
  const since = new Date(Date.now() - ANALYTICS_DAYS * 24 * 60 * 60 * 1000);
  const funnelRows = await prisma.funnelEvent.groupBy({
    by: ["event", "step"],
    where: { createdAt: { gte: since } },
    _count: { _all: true },
  });
  const statusMap = Object.fromEntries(byStatus.map((s) => [s.status, s._count._all]));
  const meetingMap = Object.fromEntries(meetings.map((s) => [s.status, s._count._all]));
  return NextResponse.json({
    analytics: shapeSiteAnalytics(
      funnelRows.map((row) => ({ event: row.event, step: row.step, count: row._count._all })),
    ),
    total,
    downloads,
    funnel: {
      forms: total,
      downloads,
      scheduled: (meetingMap.SCHEDULED || 0) + (meetingMap.CONFIRMED || 0) + (meetingMap.COMPLETED || 0),
      completed: meetingMap.COMPLETED || 0,
      noShow: meetingMap.NO_SHOW || 0,
      qualified: statusMap.QUALIFIED || 0,
      proposal: statusMap.PROPOSAL || 0,
      negotiation: statusMap.NEGOTIATION || 0,
      won: statusMap.WON || 0,
      lost: statusMap.LOST || 0,
    },
    byStatus: statusMap,
  });
}
