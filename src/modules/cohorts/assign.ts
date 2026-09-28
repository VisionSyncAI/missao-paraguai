import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { nextAssignmentStatus } from "@/modules/cohorts/capacity";

export async function assignPaidParticipant(registrationId: string, preferredCohortId?: string) {
  return prisma.$transaction(async (tx) => {
    const registration = await tx.registration.findUnique({
      where: { id: registrationId },
      include: { participant: true },
    });
    if (!registration) throw new Error("REGISTRATION_NOT_FOUND");

    const cohort = preferredCohortId
      ? await tx.cohort.findUnique({ where: { id: preferredCohortId } })
      : await tx.cohort.findFirst({
          where: { status: "OPEN", isPublic: true },
          orderBy: { createdAt: "asc" },
        });
    if (!cohort) throw new Error("COHORT_MISSING");

    const locked = await tx.$queryRaw<Array<{ id: string; seatsTaken: number; capacity: number }>>`
      SELECT id, seatsTaken, capacity FROM Cohort WHERE id = ${cohort.id}
    `;
    const row = locked[0];
    if (!row) throw new Error("COHORT_MISSING");

    const status = nextAssignmentStatus(row.seatsTaken, row.capacity);
    if (status === "CONFIRMED") {
      await tx.$executeRaw`UPDATE Cohort SET seatsTaken = seatsTaken + 1 WHERE id = ${cohort.id} AND seatsTaken < capacity`;
      const after = await tx.cohort.findUnique({ where: { id: cohort.id } });
      if (!after || after.seatsTaken > after.capacity) throw new Error("OVERBOOKING");
    }

    await tx.registration.update({
      where: { id: registrationId },
      data: { cohortId: cohort.id, status: status === "WAITLIST" ? "WAITLIST" : "CONFIRMED" },
    });

    const participant = registration.participant
      ? await tx.participant.update({
          where: { id: registration.participant.id },
          data: { cohortId: cohort.id, status, waitlisted: status === "WAITLIST" },
        })
      : await tx.participant.create({
          data: {
            registrationId,
            cohortId: cohort.id,
            accessTokenHash: `pending:${registrationId}`,
            status,
            waitlisted: status === "WAITLIST",
          },
        });

    return { status, cohortId: cohort.id, participantId: participant.id };
  }).then(async (result) => {
    await writeAudit({
      action: "COHORT_ASSIGN",
      resource: "Participant",
      resourceId: result.participantId,
      metadata: { cohortId: result.cohortId, status: result.status },
    });
    return result;
  });
}
