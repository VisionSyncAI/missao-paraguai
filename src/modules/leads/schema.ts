import { z } from "zod";
import { isValidCnpj, isValidCpf, isValidEmail, normalizePhone } from "@/lib/validation/br";
import {
  COMPANY_TYPES,
  COMPANION_TYPES,
  EMPLOYEE_BANDS,
  OBJECTIVES,
} from "@/modules/leads/status";

const boolish = z.union([z.boolean(), z.literal("true"), z.literal("false")]).transform((v) => v === true || v === "true");

export const companionSchema = z.object({
  fullName: z.string().trim().min(3).max(120),
  relationType: z.enum(COMPANION_TYPES),
  email: z.string().trim().email().optional().or(z.literal("")),
  whatsapp: z.string().trim().max(20).optional().or(z.literal("")),
});

export const interestSchema = z
  .object({
    fullName: z.string().trim().min(5).max(160),
    email: z.string().trim().toLowerCase().refine(isValidEmail, "E-mail inválido"),
    whatsapp: z.string().trim().refine((v) => Boolean(normalizePhone(v)), "WhatsApp inválido"),
    altPhone: z.string().trim().max(20).optional().or(z.literal("")),
    cpf: z.string().trim().optional().or(z.literal("")),
    birthDate: z.string().trim().optional().or(z.literal("")),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(40),
    country: z.string().trim().min(2).max(40).default("Brasil"),
    hasCompany: boolish.default(true),
    legalName: z.string().trim().max(180).optional().or(z.literal("")),
    tradeName: z.string().trim().max(180).optional().or(z.literal("")),
    cnpj: z.string().trim().optional().or(z.literal("")),
    companyType: z.string().trim().optional().or(z.literal("")),
    segment: z.string().trim().max(80).optional().or(z.literal("")),
    jobTitle: z.string().trim().max(80).optional().or(z.literal("")),
    employeeBand: z.string().trim().optional().or(z.literal("")),
    companyCity: z.string().trim().max(80).optional().or(z.literal("")),
    companyState: z.string().trim().max(40).optional().or(z.literal("")),
    website: z.string().trim().max(200).optional().or(z.literal("")),
    social: z.string().trim().max(200).optional().or(z.literal("")),
    objectives: z.array(z.string()).min(1),
    objectiveNotes: z.string().trim().max(2000).optional().or(z.literal("")),
    beenToParaguay: boolish.optional(),
    hasBusinessParaguay: boolish.optional(),
    hasPartnersParaguay: boolish.optional(),
    wantsOpenOperation: boolish.optional(),
    hasInternationalOps: boolish.optional(),
    interestInvest: boolish.optional(),
    interestNetworking: boolish.optional(),
    interestB2B: boolish.optional(),
    interestIndustry: boolish.optional(),
    participateAlone: boolish.default(true),
    companions: z.array(companionSchema).default([]),
    dietaryRestricted: boolish.optional(),
    dietaryNotes: z.string().trim().max(500).optional().or(z.literal("")),
    specialNeeds: z.string().trim().max(500).optional().or(z.literal("")),
    scheduledAt: z.string().datetime().optional().or(z.literal("")),
    consultantId: z.string().optional().or(z.literal("")),
    calBookingUid: z.string().trim().max(180).optional().or(z.literal("")),
    privacyAccepted: boolish,
    contactAccepted: boolish,
    source: z.string().trim().max(80).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.cpf && !isValidCpf(data.cpf)) {
      ctx.addIssue({ code: "custom", message: "CPF inválido", path: ["cpf"] });
    }
    if (data.hasCompany) {
      if (!data.legalName || data.legalName.length < 3) {
        ctx.addIssue({ code: "custom", message: "Razão social obrigatória", path: ["legalName"] });
      }
      if (data.cnpj && !isValidCnpj(data.cnpj)) {
        ctx.addIssue({ code: "custom", message: "CNPJ inválido", path: ["cnpj"] });
      }
      if (data.companyType && !COMPANY_TYPES.includes(data.companyType as (typeof COMPANY_TYPES)[number])) {
        ctx.addIssue({ code: "custom", message: "Tipo de empresa inválido", path: ["companyType"] });
      }
      if (data.employeeBand && !EMPLOYEE_BANDS.includes(data.employeeBand as (typeof EMPLOYEE_BANDS)[number])) {
        ctx.addIssue({ code: "custom", message: "Faixa de colaboradores inválida", path: ["employeeBand"] });
      }
    }
    const unknownObjective = data.objectives.find((o) => !OBJECTIVES.includes(o as (typeof OBJECTIVES)[number]));
    if (unknownObjective) {
      ctx.addIssue({ code: "custom", message: "Objetivo inválido", path: ["objectives"] });
    }
    if (!data.participateAlone) {
      if (data.companions.length < 1) {
        ctx.addIssue({ code: "custom", message: "Informe os acompanhantes", path: ["companions"] });
      }
      if (data.companions.length > 4) {
        ctx.addIssue({ code: "custom", message: "Máximo de 4 acompanhantes nesta etapa", path: ["companions"] });
      }
    }
    if (!data.privacyAccepted || !data.contactAccepted) {
      ctx.addIssue({ code: "custom", message: "Consentimento obrigatório", path: ["privacyAccepted"] });
    }
    if (data.dietaryRestricted && !data.dietaryNotes) {
      ctx.addIssue({ code: "custom", message: "Descreva a restrição alimentar", path: ["dietaryNotes"] });
    }
    if (!data.calBookingUid && (!data.scheduledAt || !data.consultantId)) {
      ctx.addIssue({ code: "custom", message: "Selecione um horário com o consultor", path: ["calBookingUid"] });
    }
  });

export type InterestInput = z.infer<typeof interestSchema>;
