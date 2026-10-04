import type { MarketStage } from "@/modules/leads/status";

/**
 * Internal lead scores (never shown to the visitor). v1 is a transparent heuristic so the commercial
 * team can sort the pipeline; weights live here so they can be tuned without touching the funnel.
 *
 * - fit: how close the company is to the edition's profile (segment, decision power, size, stage)
 * - interest: how strongly the lead signalled intent (declared intent, diagnosis, decision box, topics)
 * - lead: the average of the two
 */
export const SCORE_VERSION = "v1";

const PRIORITY_SEGMENTS = new Set(["Indústria", "Agro", "Logística", "Tecnologia", "Investimento"]);
const DECISION_MAKERS = new Set(["Sócio(a) / Proprietário(a)", "CEO / Presidente", "Diretor(a) / C-Level"]);
const LARGER_COMPANIES = new Set(["R$ 5 milhões – R$ 20 milhões", "R$ 20 milhões – R$ 100 milhões", "Acima de R$ 100 milhões"]);
const STAGE_FIT: Record<MarketStage, number> = { PESQUISANDO: 10, AVALIANDO: 25, ESTRUTURANDO: 25, OPERANDO: 15 };
const INTENT_WEIGHT: Record<string, number> = {
  "Quero participar da próxima edição": 40,
  "Quero conversar com um consultor": 30,
  "Quero avaliar para minha empresa/equipe": 25,
  "Quero entender melhor antes de decidir": 15,
};

export type ScoreInput = {
  segment?: string;
  jobTitle: string;
  companySize?: string;
  stage?: MarketStage | null;
  intent?: string;
  interests: string[];
  diagnosisCompleted: boolean;
  decisionBox?: string | null;
};

export type LeadScores = { fit: number; interest: number; lead: number; version: string };

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function computeScores(input: ScoreInput): LeadScores {
  const fit = clamp(
    (input.segment && PRIORITY_SEGMENTS.has(input.segment) ? 30 : 10) +
      (DECISION_MAKERS.has(input.jobTitle) ? 25 : 10) +
      (input.companySize && LARGER_COMPANIES.has(input.companySize) ? 20 : 8) +
      (input.stage ? STAGE_FIT[input.stage] : 10),
  );
  const interest = clamp(
    (input.intent ? INTENT_WEIGHT[input.intent] ?? 15 : 15) +
      Math.min(input.interests.length, 4) * 5 +
      (input.diagnosisCompleted ? 20 : 0) +
      ((input.decisionBox || "").trim().length >= 20 ? 20 : 0),
  );
  return { fit, interest, lead: clamp((fit + interest) / 2), version: SCORE_VERSION };
}
