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

export const PRIVACY_VERSION = "2026-10-02";
export const TERMS_VERSION = "2026-10-02";
export const CONTACT_CONSENT_VERSION = "2026-10-1";

export const JOB_TITLE_OPTIONS = [
  "Sócio(a) / Proprietário(a)",
  "CEO / Presidente",
  "Diretor(a) / C-Level",
  "Gerente",
  "Coordenador(a)",
  "Outro",
] as const;

export const COMPANY_SIZE_BANDS = [
  "Até R$ 81 mil/ano",
  "R$ 81 mil – R$ 350 mil",
  "R$ 350 mil – R$ 5 milhões",
  "R$ 5 milhões – R$ 20 milhões",
  "R$ 20 milhões – R$ 100 milhões",
  "Acima de R$ 100 milhões",
] as const;

/** "O que você busca no Paraguai?" — also feeds the B2B matching and the interest score. */
export const PARAGUAY_INTERESTS = [
  "Expansão",
  "Parcerias",
  "B2B",
  "Fornecedores",
  "Investimentos",
  "Tecnologia",
  "Agro",
  "Indústria",
  "Logística",
  "Networking",
  "Inteligência de mercado",
] as const;

export const BUSINESS_SEGMENTS = [
  "Indústria",
  "Agro",
  "Logística",
  "Tecnologia",
  "Serviços",
  "Infraestrutura",
  "Comércio",
  "Investimento",
  "Outro",
] as const;

/** Commercial condition the visitor came from (lot card on the site). */
export const LOT_CODES = ["01", "02", "03", "vip"] as const;

export const PARAGUAY_RELATIONSHIPS = [
  "Já opero no Paraguai",
  "Já faço negócios",
  "Já tenho parceiros",
  "Já visitei o país",
  "Ainda não",
  "Estou começando a estudar",
] as const;

export const PARTICIPATION_INTENTS = [
  "Quero participar da próxima edição",
  "Quero entender melhor antes de decidir",
  "Quero conversar com um consultor",
  "Quero avaliar para minha empresa/equipe",
] as const;

/**
 * estagio_empresa — "Em qual momento você está?" on the site's market section (?estagio=avaliando…).
 * Stored on Lead.companyStage for commercial segmentation.
 */
export const MARKET_STAGES = ["PESQUISANDO", "AVALIANDO", "ESTRUTURANDO", "OPERANDO"] as const;
export type MarketStage = (typeof MARKET_STAGES)[number];

export const MARKET_STAGE_COPY: Record<MarketStage, { label: string; detail: string; selected: string }> = {
  PESQUISANDO: { label: "Quero entender", detail: "Estou começando a pesquisar o Paraguai.", selected: "Quero entender o Paraguai" },
  AVALIANDO: { label: "Estou avaliando", detail: "Quero entender se existe uma oportunidade para minha empresa.", selected: "Estou avaliando o Paraguai" },
  ESTRUTURANDO: { label: "Estou estruturando", detail: "Já estou estudando operação, implantação ou expansão.", selected: "Estou estruturando minha entrada no Paraguai" },
  OPERANDO: { label: "Já estou aqui", detail: "Quero ampliar minha rede, conexões e oportunidades no Paraguai.", selected: "Já estou no Paraguai" },
};

/** ?estagio=avaliando → "AVALIANDO"; anything else → null. */
export function parseMarketStage(value: string | null | undefined): MarketStage | null {
  const upper = (value || "").trim().toUpperCase();
  return (MARKET_STAGES as readonly string[]).includes(upper) ? (upper as MarketStage) : null;
}

/** "O que você busca entender?" — asked instead of PARAGUAY_INTERESTS when the visitor picked a stage. */
export const UNDERSTAND_TOPICS = [
  "Ambiente de negócios",
  "Implantação",
  "Indústria",
  "Logística",
  "Tributação",
  "Maquila",
  "Parceiros",
  "Networking",
  "Investimentos",
  "Outro",
] as const;

/** Every option the interests step may store in qualification.seeking. */
export const SEEKING_OPTIONS = [...new Set([...PARAGUAY_INTERESTS, ...UNDERSTAND_TOPICS])] as [string, ...string[]];

/**
 * Diagnóstico PROVISION ("O Paraguai faz sentido para a sua empresa?") on the home page.
 * The site keeps a copy of these lists in src/js/experience.js; tests/diagnosis.test.ts keeps them in sync.
 */
export const DIAG_SEGMENTS = ["Indústria", "Agro", "Tecnologia", "Logística", "Serviços", "Investimento", "Outro"] as const;
export const DIAG_OBJECTIVES = ["Expansão", "Novos parceiros", "Fornecedores", "Produção", "Logística", "Mercado", "Investimento"] as const;
export const DIAG_PY_STAGES = [
  "Ainda estou conhecendo",
  "Já pesquisei",
  "Já tenho contatos",
  "Já opero no país",
  "Estou avaliando expansão",
] as const;
export const DIAG_CONVERSATIONS = ["Institucional", "Empresarial", "B2B", "Logística", "Investimento", "Tecnologia"] as const;
export const DIAG_PROFILES = ["Empresário", "Executivo", "Investidor", "Representante da empresa"] as const;
