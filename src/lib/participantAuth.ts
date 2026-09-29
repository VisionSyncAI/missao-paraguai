import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/crypto";
import { participantSecret, sessionTimes, signSession, verifySession } from "@/lib/signedSession";

const COOKIE = "ip_participant";
const MAX_AGE = 60 * 60 * 24 * 14;

export async function createParticipantSession(token: string) {
  const participant = await prisma.participant.findUnique({
    where: { accessTokenHash: sha256(token) },
    include: { registration: true },
  });
  if (!participant) return null;
  const times = sessionTimes(MAX_AGE);
  const signed = await signSession(
    { kind: "participant", sub: participant.id, ...times },
    participantSecret(),
  );
  const jar = await cookies();
  jar.set(COOKIE, signed, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return participant;
}

export async function readParticipantId(token: string | undefined) {
  const payload = await verifySession(token, participantSecret(), "participant");
  return payload?.sub ?? null;
}

export async function getParticipantSession() {
  const jar = await cookies();
  const id = await readParticipantId(jar.get(COOKIE)?.value);
  if (!id) return null;
  const participant = await prisma.participant.findUnique({
    where: { id },
    include: {
      registration: { include: { lead: true, orders: { include: { payments: true } }, documents: true, cohort: true } },
      cohort: true,
    },
  });
  if (!participant) return null;
  const blocked = new Set(["CANCELLED", "CANCELED", "REVOKED", "DISABLED", "BLOCKED"]);
  if (blocked.has(participant.status)) return null;
  return participant;
}

export function assertOwn(participantId: string, resourceParticipantId: string | null | undefined) {
  if (!resourceParticipantId || resourceParticipantId !== participantId) {
    throw new Error("FORBIDDEN");
  }
}
