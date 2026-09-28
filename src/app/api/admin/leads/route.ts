import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/auth";
import { staffLeadDTO } from "@/modules/leads/service";

export async function GET(request: NextRequest) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  if (!["ADMIN", "COMMERCIAL", "CONSULTANT", "FINANCE", "OPS"].includes(session.role)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const status = request.nextUrl.searchParams.get("status");
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const where: Record<string, unknown> = {};
  if (session.role === "CONSULTANT" && session.consultantId) {
    where.consultantId = session.consultantId;
  }
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { fullName: { contains: q } },
      { email: { contains: q } },
    ];
  }
  const leads = await prisma.lead.findMany({
    where,
    include: {
      company: true,
      consultant: true,
      meetings: { orderBy: { scheduledAt: "desc" }, take: 1 },
      downloads: { orderBy: { downloadedAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ leads: leads.map((lead) => staffLeadDTO(lead, session.role)) });
}
