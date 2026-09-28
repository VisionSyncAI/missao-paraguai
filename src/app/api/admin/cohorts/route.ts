import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertPermission, getStaffSession } from "@/lib/auth";

export async function GET() {
  const session = await getStaffSession();
  try {
    assertPermission(session, "cohort:read");
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: session ? 403 : 401 });
  }
  const cohorts = await prisma.cohort.findMany({ include: { edition: true, participants: true } });
  return NextResponse.json({
    cohorts: cohorts.map((c) => ({
      id: c.id,
      name: c.name,
      capacity: c.capacity,
      seatsTaken: c.seatsTaken,
      status: c.status,
      isPublic: c.isPublic,
      edition: c.edition.name,
      participants: c.participants.length,
    })),
  });
}

const schema = z.object({
  editionId: z.string(),
  name: z.string().min(2),
  capacity: z.number().int().positive(),
  isPublic: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getStaffSession();
  try {
    assertPermission(session, "cohort:write");
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: session ? 403 : 401 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Validação falhou" }, { status: 400 });
  const cohort = await prisma.cohort.create({
    data: {
      editionId: parsed.data.editionId,
      name: parsed.data.name,
      capacity: parsed.data.capacity,
      isPublic: parsed.data.isPublic ?? true,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    },
  });
  return NextResponse.json({ ok: true, cohort });
}
