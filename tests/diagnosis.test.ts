import { describe, expect, it } from "vitest";
import { DIAGNOSIS, PROFILE, diagnosisLabel as siteLabel } from "../src/js/experience.js";
import { DIAGNOSIS as LEGACY_DIAGNOSIS } from "../public/legacy/js/experience.js";
import {
  BUSINESS_SEGMENTS,
  DIAG_CONVERSATIONS,
  DIAG_OBJECTIVES,
  DIAG_PROFILES,
  DIAG_PY_STAGES,
  DIAG_SEGMENTS,
  PARAGUAY_INTERESTS,
  PARAGUAY_RELATIONSHIPS,
} from "../src/modules/leads/status";
import { diagnosisLabel, draftFromDiagnosis, INTEREST_STEPS } from "../src/modules/interest/flow";
import { captureSchema } from "../src/modules/leads/captureSchema";
import { computeScores } from "../src/modules/leads/scoring";

const sample = { segment: "Indústria", objective: "Expansão", pyStage: "Já pesquisei", conversation: "B2B", profile: "Empresário" };

describe("diagnóstico PROVISION", () => {
  it("o site e o servidor usam as mesmas opções", () => {
    expect(DIAGNOSIS.segment).toEqual([...DIAG_SEGMENTS]);
    expect(DIAGNOSIS.objective).toEqual([...DIAG_OBJECTIVES]);
    expect(DIAGNOSIS.pyStage).toEqual([...DIAG_PY_STAGES]);
    expect(DIAGNOSIS.conversation).toEqual([...DIAG_CONVERSATIONS]);
    expect(DIAGNOSIS.profile).toEqual([...DIAG_PROFILES]);
    expect(LEGACY_DIAGNOSIS).toEqual(DIAGNOSIS);
  });

  it("cada perfil de empresa tem texto e jornada próprios", () => {
    for (const slug of ["industria", "agro", "tecnologia", "logistica", "investimento", "servicos", "outro"]) {
      expect(PROFILE[slug].text).toMatch(/^A partir das suas respostas/);
      expect(PROFILE[slug].step2[0]).toMatch(/^02 — /);
    }
  });

  it("o rótulo do perfil é o mesmo no site e no formulário", () => {
    expect(diagnosisLabel(sample)).toBe("INDÚSTRIA · EXPANSÃO · B2B");
    expect(siteLabel(sample)).toBe(diagnosisLabel(sample));
  });

  it("pré-preenche o formulário só com valores válidos", () => {
    const draft = draftFromDiagnosis(sample);
    expect(draft.segment).toBe("Indústria");
    expect(draft.interests).toEqual(["Expansão"]);
    expect(draft.stage).toBe("AVALIANDO");
    expect(PARAGUAY_RELATIONSHIPS).toContain(draft.relationship);
    for (const s of DIAG_SEGMENTS) expect(BUSINESS_SEGMENTS).toContain(s);
    for (const o of DIAG_OBJECTIVES) {
      const d = draftFromDiagnosis({ ...sample, objective: o });
      expect(PARAGUAY_INTERESTS).toContain(d.interests?.[0]);
    }
  });

  it("o formulário não pergunta mais por representantes extras (no máximo 20 pessoas)", () => {
    expect(INTEREST_STEPS).not.toContain("delegation" as never);
  });

  it("aceita diagnóstico e Decision Box no envio e recusa respostas fora da lista", () => {
    const base = {
      fullName: "Ana Souza Lima",
      email: "ana@empresa.com",
      whatsapp: "11988887777",
      companyName: "Indústria Exemplo SA",
      segment: "Indústria",
      jobTitle: "CEO / Presidente",
      companySize: "R$ 5 milhões – R$ 20 milhões",
      interests: ["Expansão"],
      relationship: "Ainda não",
      intent: "Quero conversar com um consultor",
      consent: true,
    };
    expect(captureSchema.safeParse({ ...base, diagnosis: sample, decisionBox: "Fornecedores para uma segunda fábrica." }).success).toBe(true);
    expect(captureSchema.safeParse({ ...base, diagnosis: { ...sample, segment: "Turismo" } }).success).toBe(false);
    expect(captureSchema.safeParse({ ...base, segment: "Investimento" }).success).toBe(true);
  });
});

describe("scores internos", () => {
  it("ficam entre 0 e 100 e sobem com sinais mais fortes", () => {
    const weak = computeScores({ segment: "Outro", jobTitle: "Coordenador(a)", companySize: "Até R$ 81 mil/ano", stage: null, intent: "Quero entender melhor antes de decidir", interests: [], diagnosisCompleted: false });
    const strong = computeScores({ segment: "Indústria", jobTitle: "CEO / Presidente", companySize: "Acima de R$ 100 milhões", stage: "ESTRUTURANDO", intent: "Quero participar da próxima edição", interests: ["Expansão", "B2B", "Indústria"], diagnosisCompleted: true, decisionBox: "Quero avaliar uma segunda planta perto de Asunción." });
    for (const s of [weak, strong]) for (const v of [s.fit, s.interest, s.lead]) expect(v).toBeGreaterThanOrEqual(0), expect(v).toBeLessThanOrEqual(100);
    expect(strong.lead).toBeGreaterThan(weak.lead);
    expect(strong.version).toBe("v1");
  });
});
