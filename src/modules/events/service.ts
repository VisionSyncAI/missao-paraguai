import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { EVENT_TYPES, overlaps } from "@/modules/events/rules";

export { EVENT_TYPES, overlaps } from "@/modules/events/rules";

export async function createMissionEvent(input: {
  title: string;
  type: string;
  startsAt: string;
  endsAt: string;
  editionId?: string;
  cohortId?: string;
  locationId?: string;
  notes?: string;
  actorId?: string;
}) {
  if (!EVENT_TYPES.includes(input.type as (typeof EVENT_TYPES)[number])) throw new Error("EVENT_TYPE");
  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(input.endsAt);
  if (!(startsAt < endsAt)) throw new Error("EVENT_RANGE");

  if (input.cohortId) {
    const existing = await prisma.missionEvent.findMany({ where: { cohortId: input.cohortId } });
    if (existing.some((event) => overlaps(startsAt, endsAt, event.startsAt, event.endsAt))) {
      throw new Error("EVENT_CONFLICT");
    }
  }

  const created = await prisma.missionEvent.create({
    data: {
      title: input.title,
      type: input.type,
      startsAt,
      endsAt,
      editionId: input.editionId,
      cohortId: input.cohortId,
      locationId: input.locationId,
      notes: input.notes,
    },
  });
  await writeAudit({ actorId: input.actorId, action: "EVENT_CREATED", resource: "MissionEvent", resourceId: created.id });
  return created;
}
