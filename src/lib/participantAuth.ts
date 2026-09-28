import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/crypto";

const COOKIE = "ip_participant";

export async function createParticipantSession(token: string) {
  const participant = await prisma.participant.findUnique({
    where: { accessTokenHash: sha256(token) },
    include: { registration: true },
  });
  if (!participant) return null;
  const jar = await cookies();
  jar.set(COOKIE, participant.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return participant;
}

export async function getParticipantSession() {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;
  if (!id) return null;
  return prisma.participant.findUnique({
    where: { id },
    include: {
      registration: { include: { lead: true, orders: { include: { payments: true } }, documents: true, cohort: true } },
      cohort: true,
    },
  });
}

export function assertOwn(participantId: string, resourceParticipantId: string | null | undefined) {
  if (!resourceParticipantId || resourceParticipantId !== participantId) {
    throw new Error("FORBIDDEN");
  }
}
