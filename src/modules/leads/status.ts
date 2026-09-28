export const LEAD_STATUSES = [
  "NEW",
  "FORM_SUBMITTED",
  "PRESENTATION_AVAILABLE",
  "MEETING_SCHEDULED",
  "MEETING_CONFIRMED",
  "MEETING_COMPLETED",
  "QUALIFIED",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const MEETING_STATUSES = [
  "SCHEDULED",
  "CONFIRMED",
  "RESCHEDULED",
  "COMPLETED",
  "NO_SHOW",
  "CANCELLED",
] as const;

export type MeetingStatus = (typeof MEETING_STATUSES)[number];

const LEAD_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  NEW: ["FORM_SUBMITTED", "LOST"],
  FORM_SUBMITTED: ["PRESENTATION_AVAILABLE", "MEETING_SCHEDULED", "LOST"],
  PRESENTATION_AVAILABLE: ["MEETING_SCHEDULED", "LOST"],
  MEETING_SCHEDULED: ["MEETING_CONFIRMED", "MEETING_COMPLETED", "LOST"],
  MEETING_CONFIRMED: ["MEETING_COMPLETED", "LOST"],
  MEETING_COMPLETED: ["QUALIFIED", "LOST"],
  QUALIFIED: ["PROPOSAL", "LOST"],
  PROPOSAL: ["NEGOTIATION", "WON", "LOST"],
  NEGOTIATION: ["WON", "LOST"],
  WON: [],
  LOST: ["QUALIFIED"],
};

export function canTransitionLead(from: string, to: string) {
  if (from === to) return true;
  const allowed = LEAD_TRANSITIONS[from as LeadStatus];
  if (!allowed) return false;
  if (to === "LOST" && from !== "WON") return true;
  return allowed.includes(to as LeadStatus);
}

export const COMPANY_TYPES = [
  "Indústria",
  "Agronegócio",
  "Comércio",
  "Serviços",
  "Tecnologia",
  "Logística",
  "Construção",
  "Investimentos",
  "Consultoria",
  "Outro",
] as const;

export const OBJECTIVES = [
  "Conhecer oportunidades no Paraguai",
  "Expandir empresa",
  "Internacionalização",
  "Investimentos",
  "Networking",
  "Parcerias comerciais",
  "Conhecer mercado",
  "Buscar fornecedores",
  "Buscar clientes",
  "Explorar instalação de operação",
  "Conhecer ambiente industrial",
  "Conhecer oportunidades no agro",
  "Relações institucionais",
  "Tecnologia",
  "Outro",
] as const;

export const COMPANION_TYPES = [
  "Cônjuge",
  "Sócio",
  "Familiar",
  "Colaborador",
  "Parceiro de negócios",
  "Outro",
] as const;

export const EMPLOYEE_BANDS = ["1-10", "11-50", "51-200", "201-500", "500+"] as const;

export const PRIVACY_VERSION = "2026-09-1";
export const TERMS_VERSION = "2026-09-1";
export const CONTACT_CONSENT_VERSION = "2026-09-1";
