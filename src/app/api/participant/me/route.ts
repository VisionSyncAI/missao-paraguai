import { NextResponse } from "next/server";
import { getParticipantSession } from "@/lib/participantAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getParticipantSession();
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const events = session.cohortId
    ? await prisma.missionEvent.findMany({
        where: { OR: [{ cohortId: session.cohortId }, { cohortId: null, editionId: session.cohort?.editionId }] },
        include: { location: true },
        orderBy: { startsAt: "asc" },
      })
    : [];
  const meetings = await prisma.meeting.findMany({
    where: { leadId: session.registration.leadId },
    orderBy: { scheduledAt: "asc" },
    select: {
      id: true,
      scheduledAt: true,
      status: true,
      meetingUrl: true,
      consultant: { select: { name: true } },
    },
  });
  return NextResponse.json({
    participant: {
      id: session.id,
      status: session.status,
      waitlisted: session.waitlisted,
      name: session.registration.fullName,
      companyName: session.registration.companyName,
      meetings,
      email: session.registration.email,
      registration: {
        id: session.registration.id,
        status: session.registration.status,
        arrivalNotes: session.registration.arrivalNotes,
        departureNotes: session.registration.departureNotes,
        dietaryNotes: session.registration.dietaryNotes,
      },
      cohort: session.cohort ? { id: session.cohort.id, name: session.cohort.name } : null,
      orders: session.registration.orders.map((o) => ({
        id: o.id,
        status: o.status,
        totalCents: o.totalCents,
        payments: o.payments.map((p) => ({ id: p.id, status: p.status, checkoutUrl: p.checkoutUrl })),
      })),
      documents: session.registration.documents.map((d) => ({
        id: d.id,
        status: d.status,
        originalName: d.originalName,
      })),
      events: events.map((e) => ({
        id: e.id,
        title: e.title,
        type: e.type,
        startsAt: e.startsAt,
        endsAt: e.endsAt,
        location: e.location?.name ?? null,
      })),
    },
  });
}
