import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertPermission, getStaffSession } from "@/lib/auth";

export async function GET() {
  const session = await getStaffSession();
  try {
    assertPermission(session, "participant:read");
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: session ? 403 : 401 });
  }
  const rows = await prisma.participant.findMany({
    include: { registration: true, cohort: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    participants: rows.map((p) => ({
      id: p.id,
      status: p.status,
      waitlisted: p.waitlisted,
      name: p.registration.fullName,
      email: p.registration.email,
      cohort: p.cohort?.name ?? null,
    })),
  });
}
