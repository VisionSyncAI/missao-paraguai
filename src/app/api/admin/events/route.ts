import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertPermission, getStaffSession } from "@/lib/auth";
import { EVENT_TYPES, createMissionEvent } from "@/modules/events/service";

export async function GET() {
  const session = await getStaffSession();
  try {
    assertPermission(session, "event:read");
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: session ? 403 : 401 });
  }
  const events = await prisma.missionEvent.findMany({ include: { location: true, cohort: true }, orderBy: { startsAt: "asc" } });
  return NextResponse.json({ events, types: EVENT_TYPES });
}

const schema = z.object({
  title: z.string().min(2),
  type: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
  editionId: z.string().optional(),
  cohortId: z.string().optional(),
  locationId: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getStaffSession();
  try {
    assertPermission(session, "event:write");
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: session ? 403 : 401 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Validação falhou" }, { status: 400 });
  try {
    const event = await createMissionEvent({ ...parsed.data, actorId: session!.userId });
    return NextResponse.json({ ok: true, event });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    return NextResponse.json({ error: message }, { status: message === "EVENT_CONFLICT" ? 409 : 400 });
  }
}
