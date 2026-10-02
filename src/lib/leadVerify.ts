import { leadSessionSecret, sessionTimes, signSession, verifySession } from "@/lib/signedSession";

const MAX_AGE = 60 * 60 * 24;

/** Link sent only to the lead's own inbox; proves control of the e-mail before a session is issued. */
export async function signLeadVerifyToken(leadId: string) {
  return signSession({ kind: "lead_verify", sub: leadId, ...sessionTimes(MAX_AGE) }, leadSessionSecret());
}

export async function readLeadVerifyToken(token: string | null | undefined) {
  const payload = await verifySession(token ?? undefined, leadSessionSecret(), "lead_verify");
  return payload?.sub ?? null;
}
