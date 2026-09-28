import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/auth";

export async function GET() {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
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
  const statusMap = Object.fromEntries(byStatus.map((s) => [s.status, s._count._all]));
  const meetingMap = Object.fromEntries(meetings.map((s) => [s.status, s._count._all]));
  return NextResponse.json({
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
