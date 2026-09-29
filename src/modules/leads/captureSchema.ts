import { z } from "zod";
import { isValidEmail, normalizePhone } from "@/lib/validation/br";
import {
  COMPANY_SIZE_BANDS,
  JOB_TITLE_OPTIONS,
  PARAGUAY_INTERESTS,
  PARAGUAY_RELATIONSHIPS,
  PARTICIPATION_INTENTS,
} from "@/modules/leads/status";
import { normalizeName } from "@/modules/interest/flow";

export const captureSchema = z.object({
  fullName: z.string().transform(normalizeName).pipe(z.string().min(5).max(160)),
  email: z.string().trim().toLowerCase().refine(isValidEmail, "E-mail inválido"),
  whatsapp: z.string().trim().refine((v) => Boolean(normalizePhone(v)), "WhatsApp inválido"),
  jobTitle: z.enum(JOB_TITLE_OPTIONS),
  jobTitleOther: z.string().trim().max(80).optional().or(z.literal("")),
  companySize: z.enum(COMPANY_SIZE_BANDS),
  interests: z.array(z.enum(PARAGUAY_INTERESTS)).min(1),
  objective: z.string().trim().max(2000).optional().or(z.literal("")),
  relationship: z.enum(PARAGUAY_RELATIONSHIPS),
  intent: z.enum(PARTICIPATION_INTENTS),
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
