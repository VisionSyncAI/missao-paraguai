import { isValidEmail, normalizePhone } from "@/lib/validation/br";
import {
  BUSINESS_SEGMENTS,
  COMPANY_SIZE_BANDS,
  JOB_TITLE_OPTIONS,
  MARKET_STAGES,
  SEEKING_OPTIONS,
  PARAGUAY_RELATIONSHIPS,
  PARTICIPATION_INTENTS,
} from "@/modules/leads/status";

/** Every question the flow knows. Segment, stage, size, objective, relationship and intent are optional:
 *  they come from the diagnosis when available, or from the conversation with the consultant. */
export const ALL_STEPS = [
  "name",
  "company",
  "role",
  "contact",
  "segment",
  "interests",
  "stage",
  "companySize",
  "objective",
  "relationship",
  "intent",
  "consent",
] as const;

export type InterestStep = (typeof ALL_STEPS)[number];

/** Asked before the first conversation: name, company, role, contact, main objective, consent. */
export const INTEREST_STEPS: readonly InterestStep[] = ["name", "company", "role", "contact", "interests", "consent"];

export type InterestDraft = {
  fullName: string;
  email: string;
  whatsapp: string;
  companyName: string;
  segment: string;
  lot: string;
  stage: string;
  jobTitle: string;
  jobTitleOther: string;
  companySize: string;
  interests: string[];
  objective: string;
  relationship: string;
  intent: string;
  delegationSize: number | null;
  oversizedGroup: boolean;
  companionRequested: boolean | null;
  consent: boolean;
};

export function emptyDraft(): InterestDraft {
  return {
    fullName: "",
    email: "",
    whatsapp: "",
    companyName: "",
    segment: "",
    lot: "",
    stage: "",
    jobTitle: "",
    jobTitleOther: "",
    companySize: "",
    interests: [],
    objective: "",
    relationship: "",
    intent: "",
    delegationSize: null,
    oversizedGroup: false,
    companionRequested: null,
    consent: false,
  };
}

export function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

/** Message shown and sent right after the profile arrives: the consultant calls the client by name. */
export function consultantCallMessage(fullName: string) {
  const first = normalizeName(fullName).split(" ")[0];
  return `${first ? `Olá, ${first}!` : "Olá!"} Um de nossos consultores entrará em contato com você para conversar sobre a PROVISION.`;
}

export function validateStep(step: InterestStep, draft: InterestDraft) {
  if (step === "name") {
    const name = normalizeName(draft.fullName);
    if (name.length < 5) return "Informe seu nome completo.";
    return null;
  }
  if (step === "contact") {
    if (!normalizePhone(draft.whatsapp)) return "Informe um WhatsApp válido.";
    if (!isValidEmail(draft.email)) return "Informe um e-mail válido.";
    return null;
  }
  if (step === "company") {
    if (normalizeName(draft.companyName).length < 2) return "Informe o nome da sua empresa.";
    return null;
  }
  if (step === "segment") {
    if (!BUSINESS_SEGMENTS.includes(draft.segment as (typeof BUSINESS_SEGMENTS)[number])) {
      return "Selecione o segmento da empresa.";
    }
    return null;
  }
  if (step === "stage") {
    if (!MARKET_STAGES.includes(draft.stage as (typeof MARKET_STAGES)[number])) {
      return "Selecione o momento da sua empresa.";
    }
    return null;
  }
  if (step === "role") {
    if (!JOB_TITLE_OPTIONS.includes(draft.jobTitle as (typeof JOB_TITLE_OPTIONS)[number])) {
      return "Selecione o cargo.";
    }
    if (draft.jobTitle === "Outro" && normalizeName(draft.jobTitleOther).length < 2) {
      return "Descreva o cargo.";
    }
    return null;
  }
  if (step === "companySize") {
    if (!COMPANY_SIZE_BANDS.includes(draft.companySize as (typeof COMPANY_SIZE_BANDS)[number])) {
      return "Selecione o porte.";
    }
    return null;
  }
  if (step === "interests") {
    if (!draft.interests.length) return "Selecione ao menos uma opção.";
    const invalid = draft.interests.some(
      (item) => !SEEKING_OPTIONS.includes(item),
    );
    if (invalid) return "Interesse inválido.";
    return null;
  }
  if (step === "objective") return null;
  if (step === "relationship") {
    if (!PARAGUAY_RELATIONSHIPS.includes(draft.relationship as (typeof PARAGUAY_RELATIONSHIPS)[number])) {
      return "Selecione uma opção.";
    }
    return null;
  }
  if (step === "intent") {
    if (!PARTICIPATION_INTENTS.includes(draft.intent as (typeof PARTICIPATION_INTENTS)[number])) {
      return "Selecione uma opção.";
    }
    return null;
  }
  if (step === "consent") {
    if (!draft.consent) return "É necessário autorizar o contato.";
    return null;
  }
  return "Etapa inválida.";
}

export function mapRelationship(value: string) {
  return {
    beenToParaguay: value === "Já visitei o país" || value === "Já opero no Paraguai",
    hasBusinessParaguay: value === "Já faço negócios" || value === "Já opero no Paraguai",
    hasPartnersParaguay: value === "Já tenho parceiros",
    wantsOpenOperation: value === "Abrir operação no Paraguai" || value === "Já opero no Paraguai",
  };
}

export function mapInterestFlags(interests: string[]) {
  return {
    wantsOpenOperation: interests.includes("Expansão") || interests.includes("Implantação"),
    interestInvest: interests.includes("Investimentos") || interests.includes("Investimento"),
    interestNetworking: interests.includes("Networking") || interests.includes("Parcerias") || interests.includes("Parceiros"),
    interestB2B:
      interests.includes("B2B") || interests.includes("Fornecedores") || interests.includes("Parcerias") || interests.includes("Parceiros"),
    interestIndustry: interests.includes("Indústria"),
  };
}

export function resolvedJobTitle(draft: Pick<InterestDraft, "jobTitle" | "jobTitleOther">) {
  return draft.jobTitle === "Outro" ? normalizeName(draft.jobTitleOther) : draft.jobTitle;
}

export function interesseHref(search: string) {
  const params = new URLSearchParams(search);
  const next = new URLSearchParams();
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const value = params.get(key);
    if (value) next.set(key, value);
  }
  const query = next.toString();
  return query ? `/interesse?${query}` : "/interesse";
}

export function parseUtm(search: string) {
  const params = new URLSearchParams(search);
  const utm: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const value = params.get(key);
    if (value) utm[key] = value;
  }
  return utm;
}

/** Answers of the home-page diagnosis, carried to /interesse in localStorage ("provision.diagnosis"). */
export type DiagnosisAnswers = {
  segment: string;
  objective: string;
  pyStage: string;
  conversation: string;
  profile: string;
  completedAt?: string;
};

const DIAG_OBJECTIVE_TO_INTEREST: Record<string, string> = {
  Expansão: "Expansão",
  "Novos parceiros": "Parcerias",
  Fornecedores: "Fornecedores",
  Produção: "Indústria",
  Logística: "Logística",
  Mercado: "Inteligência de mercado",
  Investimento: "Investimentos",
};
const DIAG_PY_TO_STAGE: Record<string, string> = {
  "Ainda estou conhecendo": "PESQUISANDO",
  "Já pesquisei": "AVALIANDO",
  "Já tenho contatos": "AVALIANDO",
  "Estou avaliando expansão": "ESTRUTURANDO",
  "Já opero no país": "OPERANDO",
};
const DIAG_PY_TO_RELATIONSHIP: Record<string, string> = {
  "Ainda estou conhecendo": "Ainda não",
  "Já pesquisei": "Estou começando a estudar",
  "Já tenho contatos": "Já tenho parceiros",
  "Já opero no país": "Já opero no Paraguai",
};

/** What the diagnosis can pre-fill in the commercial form; every field stays editable. */
export function draftFromDiagnosis(d: DiagnosisAnswers): Partial<InterestDraft> {
  const out: Partial<InterestDraft> = {};
  if ((BUSINESS_SEGMENTS as readonly string[]).includes(d.segment)) out.segment = d.segment;
  const interest = DIAG_OBJECTIVE_TO_INTEREST[d.objective];
  if (interest) out.interests = [interest];
  if (DIAG_PY_TO_STAGE[d.pyStage]) out.stage = DIAG_PY_TO_STAGE[d.pyStage];
  if (DIAG_PY_TO_RELATIONSHIP[d.pyStage]) out.relationship = DIAG_PY_TO_RELATIONSHIP[d.pyStage];
  return out;
}

/** "INDÚSTRIA · EXPANSÃO · B2B" — the label shown on the result and on the form. */
export function diagnosisLabel(d: Pick<DiagnosisAnswers, "segment" | "objective" | "conversation">) {
  return [d.segment, d.objective, d.conversation].filter(Boolean).join(" · ").toUpperCase();
}
