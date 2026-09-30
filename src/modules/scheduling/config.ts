export function calConfig() {
  const apiUrl = (process.env.CAL_API_URL || "").replace(/\/$/, "");
  const apiKey = process.env.CAL_API_KEY || "";
  const eventTypeId = process.env.CAL_EVENT_TYPE_ID || "";
  const calLink = process.env.CAL_EVENT_SLUG || "";
  const embedOrigin = (process.env.CAL_EMBED_ORIGIN || apiUrl || "").replace(/\/$/, "");
  const webhookSecret = process.env.CAL_WEBHOOK_SECRET || "";
  const configured = Boolean(apiUrl && apiKey && (eventTypeId || calLink));
  return { apiUrl, apiKey, eventTypeId, calLink, embedOrigin, webhookSecret, configured };
}

/** Agenda do CRM quando o Cal.diy não está configurado — inclusive em produção. */
export function allowLocalScheduler(_env = process.env.NODE_ENV, configured = calConfig().configured) {
  return !configured;
}
