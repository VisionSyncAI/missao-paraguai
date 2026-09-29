import { cookies } from "next/headers";
import { leadSessionSecret, sessionTimes, signSession, verifySession } from "@/lib/signedSession";

const COOKIE = "ip_lead";
const MAX_AGE = 60 * 60 * 24 * 7;

export async function setLeadSession(leadId: string) {
  const times = sessionTimes(MAX_AGE);
  const token = await signSession({ kind: "lead", sub: leadId, ...times }, leadSessionSecret());
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getLeadSessionId() {
  const jar = await cookies();
  const payload = await verifySession(jar.get(COOKIE)?.value, leadSessionSecret(), "lead");
  return payload?.sub ?? null;
}
