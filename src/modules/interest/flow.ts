import { isValidEmail, normalizePhone } from "@/lib/validation/br";
import {
  COMPANY_SIZE_BANDS,
  JOB_TITLE_OPTIONS,
  PARAGUAY_INTERESTS,
  PARAGUAY_RELATIONSHIPS,
  PARTICIPATION_INTENTS,
} from "@/modules/leads/status";

export const INTEREST_STEPS = [
  "name",
  "contact",
  "role",
  "companySize",
  "interests",
  "objective",
  "relationship",
  "intent",
  "consent",
] as const;

export type InterestStep = (typeof INTEREST_STEPS)[number];

export type InterestDraft = {
  fullName: string;
  email: string;
  whatsapp: string;
  jobTitle: string;
  jobTitleOther: string;
  companySize: string;
  interests: string[];
  objective: string;
  relationship: string;
  intent: string;
  consent: boolean;
};

export function emptyDraft(): InterestDraft {
  return {
    fullName: "",
    email: "",
    whatsapp: "",
    jobTitle: "",
    jobTitleOther: "",
    companySize: "",
    interests: [],
    objective: "",
    relationship: "",
    intent: "",
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
    if (!draft.interests.length) return "Selecione ao menos um interesse.";
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
    wantsOpenOperation: interests.includes("Abrir operação no Paraguai"),
    interestInvest: interests.includes("Investimentos"),
    interestNetworking: interests.includes("Encontrar parceiros comerciais"),
    interestB2B: interests.includes("Encontrar fornecedores") || interests.includes("Encontrar parceiros comerciais"),
    interestIndustry: interests.includes("Conhecer oportunidades na indústria"),
  };
}

export function resolvedJobTitle(draft: InterestDraft) {
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
