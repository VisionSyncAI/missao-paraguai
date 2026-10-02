import { isValidEmail, normalizePhone } from "@/lib/validation/br";
import {
  BUSINESS_SEGMENTS,
  COMPANY_SIZE_BANDS,
  JOB_TITLE_OPTIONS,
  PARAGUAY_INTERESTS,
  PARAGUAY_RELATIONSHIPS,
  PARTICIPATION_INTENTS,
} from "@/modules/leads/status";

export const INTEREST_STEPS = [
  "name",
  "contact",
  "company",
  "segment",
  "role",
  "companySize",
  "interests",
  "objective",
  "relationship",
  "intent",
  "delegation",
  "companion",
  "consent",
] as const;

export type InterestStep = (typeof INTEREST_STEPS)[number];

export type InterestDraft = {
  fullName: string;
  email: string;
  whatsapp: string;
  companyName: string;
  segment: string;
  lot: string;
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
      (item) => !PARAGUAY_INTERESTS.includes(item as (typeof PARAGUAY_INTERESTS)[number]),
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
  if (step === "delegation") {
    if (draft.oversizedGroup) {
      return "Cada empresa pode participar com uma delegação de até 5 participantes. Para grupos maiores, entre em contato com a equipe PROVISION.";
    }
    if (!draft.delegationSize || draft.delegationSize < 1 || draft.delegationSize > 5) {
      return "Informe uma delegação de 1 a 5 participantes.";
    }
    return null;
  }
  if (step === "companion") {
    if (draft.companionRequested === null) return "Informe se deseja um ingresso adicional de acompanhante.";
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
    wantsOpenOperation: interests.includes("Expansão"),
    interestInvest: interests.includes("Investimentos"),
    interestNetworking: interests.includes("Networking") || interests.includes("Parcerias"),
    interestB2B: interests.includes("B2B") || interests.includes("Fornecedores") || interests.includes("Parcerias"),
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
