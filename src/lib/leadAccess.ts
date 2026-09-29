import { getLeadSessionId } from "@/lib/leadSession";
import { findLeadById, findLeadByToken } from "@/modules/leads/service";

export async function resolvePublicLead(token: string | null) {
  if (token) {
    const byToken = await findLeadByToken(token);
    if (byToken) return byToken;
  }
  const leadId = await getLeadSessionId();
  if (!leadId) return null;
  return findLeadById(leadId);
}
