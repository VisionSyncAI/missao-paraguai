import { z } from "zod";
import { isValidEmail, normalizePhone } from "@/lib/validation/br";
import {
  BUSINESS_SEGMENTS,
  COMPANY_SIZE_BANDS,
  JOB_TITLE_OPTIONS,
  DIAG_CONVERSATIONS,
  DIAG_OBJECTIVES,
  DIAG_PROFILES,
  DIAG_PY_STAGES,
  DIAG_SEGMENTS,
  LOT_CODES,
  MARKET_STAGES,
  SEEKING_OPTIONS,
  PARAGUAY_RELATIONSHIPS,
  PARTICIPATION_INTENTS,
} from "@/modules/leads/status";
import { normalizeName } from "@/modules/interest/flow";

/** Optional choices the short form never asked arrive as "": treat them as not informed. */
const optionalChoice = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess((v) => (v === "" ? undefined : v), z.enum(values).optional());

export const captureSchema = z.object({
  fullName: z.string().transform(normalizeName).pipe(z.string().min(5).max(160)),
  email: z.string().trim().toLowerCase().refine(isValidEmail, "E-mail inválido"),
  whatsapp: z.string().trim().refine((v) => Boolean(normalizePhone(v)), "WhatsApp inválido"),
  companyName: z.string().transform(normalizeName).pipe(z.string().min(2).max(160)),
  segment: optionalChoice(BUSINESS_SEGMENTS),
  lot: z.enum(LOT_CODES).optional(),
  stage: z.enum(MARKET_STAGES).optional(),
  diagnosis: z
    .object({
      segment: z.enum(DIAG_SEGMENTS),
      objective: z.enum(DIAG_OBJECTIVES),
      pyStage: z.enum(DIAG_PY_STAGES),
      conversation: z.enum(DIAG_CONVERSATIONS),
      profile: z.enum(DIAG_PROFILES),
      completedAt: z.string().max(40).optional(),
    })
    .optional(),
  decisionBox: z.string().trim().max(1200).optional().or(z.literal("")),
  jobTitle: z.enum(JOB_TITLE_OPTIONS),
  jobTitleOther: z.string().trim().max(80).optional().or(z.literal("")),
  companySize: optionalChoice(COMPANY_SIZE_BANDS),
  interests: z.array(z.enum(SEEKING_OPTIONS)).min(1),
  objective: z.string().trim().max(2000).optional().or(z.literal("")),
  relationship: optionalChoice(PARAGUAY_RELATIONSHIPS),
  intent: optionalChoice(PARTICIPATION_INTENTS),
  delegationSize: z.number().int().min(1).max(3).optional(),
  companionRequested: z.boolean().optional(),
  consent: z.literal(true),
  source: z.string().trim().max(80).optional(),
  utm: z.record(z.string(), z.string()).optional(),
  idempotencyKey: z.string().trim().max(80).optional(),
});

export const attachMeetingSchema = z.object({
  token: z.string().min(16).optional().or(z.literal("")),
  calBookingUid: z.string().trim().max(180).optional().or(z.literal("")),
  scheduledAt: z.string().optional().or(z.literal("")),
  consultantId: z.string().optional().or(z.literal("")),
});

export type CaptureInput = z.infer<typeof captureSchema>;
