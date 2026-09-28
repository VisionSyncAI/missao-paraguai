import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertPermission, getStaffSession } from "@/lib/auth";
import { createRegistrationFromLead } from "@/modules/registrations/service";

export async function GET() {
  const session = await getStaffSession();
  try {
    assertPermission(session, "registration:read");
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: session ? 403 : 401 });
  }
  const rows = await prisma.registration.findMany({
    include: { lead: true, cohort: true, participant: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    registrations: rows.map((r) => ({
      id: r.id,
      status: r.status,
      name: r.fullName,
      email: r.email,
      leadId: r.leadId,
      cohort: r.cohort?.name ?? null,
      participantStatus: r.participant?.status ?? null,
    })),
  });
}

const schema = z.object({ leadId: z.string() });

export async function POST(request: NextRequest) {
  const session = await getStaffSession();
  try {
    assertPermission(session, "registration:write");
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: session ? 403 : 401 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Validação falhou" }, { status: 400 });
  try {
    const result = await createRegistrationFromLead(parsed.data.leadId, session!.userId);
    return NextResponse.json({ ok: true, registration: result.registration });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "UNKNOWN" }, { status: 409 });
  }
}
