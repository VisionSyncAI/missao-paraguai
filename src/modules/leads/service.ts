import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashIp, newAccessToken, sha256 } from "@/lib/crypto";
import { onlyDigits } from "@/lib/validation/br";
import { CONTACT_CONSENT_VERSION, MARKET_STAGE_COPY, PRIVACY_VERSION, TERMS_VERSION } from "@/modules/leads/status";
import { formatSaoPaulo } from "@/lib/timezone";
import { emailDeliveryStatus, emailUnique, enqueueEmail } from "@/modules/comms/email";
import { officialMeetingUrl } from "@/lib/meetingLink";
import { EmailCopy } from "@/modules/comms/templates";
import type { CaptureInput } from "@/modules/leads/captureSchema";
import { logInfo } from "@/lib/logger";
import { resolveVerifiedBooking } from "@/modules/scheduling/resolve";
import { mapInterestFlags, mapRelationship, resolvedJobTitle } from "@/modules/interest/flow";
import { computeScores } from "@/modules/leads/scoring";
import { can } from "@/lib/rbac";
import { signLeadVerifyToken } from "@/lib/leadVerify";

const RESUBMIT_EMAIL_WINDOW_MS = 10 * 60 * 1000;

function persistableMeetingUrl(url?: string | null) {
  return officialMeetingUrl(url) ?? "";
}

function appUrl() {
  return process.env.APP_URL || "http://localhost:3000";
}

/** Fluxo oficial de captação: /interesse → captureInterest → Lead → CRM → Cal.diy → Meeting. */
export async function captureInterest(input: CaptureInput, meta: { ip: string | null; userAgent: string | null }) {
  const jobTitle = resolvedJobTitle({ jobTitle: input.jobTitle, jobTitleOther: input.jobTitleOther || "" });
  const relation = mapRelationship(input.relationship);
  const flags = mapInterestFlags(input.interests);
  const qualification = {
    companyName: input.companyName,
    segment: input.segment,
    seeking: input.interests,
    lotOfInterest: input.lot ?? null,
    stage: input.stage ?? null,
    diagnosis: input.diagnosis ?? null,
    decisionBox: input.decisionBox || null,
    scores: computeScores({
      segment: input.segment,
      jobTitle: input.jobTitle,
      companySize: input.companySize,
      stage: input.stage ?? null,
      intent: input.intent,
      interests: input.interests,
      diagnosisCompleted: Boolean(input.diagnosis),
      decisionBox: input.decisionBox,
    }),
    submittedAt: new Date().toISOString(),
    companySize: input.companySize,
    relationship: input.relationship,
    intent: input.intent,
    jobTitleOption: input.jobTitle,
    delegationSize: input.delegationSize ?? null,
    companionRequested: input.companionRequested === true,
    companionTicket: input.companionRequested ? "adicional, sem desconto, fora do ingresso principal" : null,
    utm: input.utm || {},
  };
  const phone = onlyDigits(input.whatsapp);
  const existing = await prisma.lead.findFirst({
    where: {
      email: input.email,
      status: { notIn: ["WON", "LOST"] },
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    // An e-mail address is not proof of identity: never overwrite the existing lead or hand out
    // its session here. The submission is kept for the CRM and the owner confirms via their inbox.
    await prisma.activity.create({
      data: {
        leadId: existing.id,
        type: "INTEREST_RESUBMITTED",
        body: `Nova pré-inscrição com este e-mail (dados não aplicados; aguardando confirmação pelo e-mail). Nome informado: ${input.fullName} · WhatsApp informado: ${phone} · Empresa informada: ${input.companyName} (${input.segment})${input.lot ? ` · Lote de interesse: ${input.lot}` : ""}${input.stage ? ` · Momento: ${MARKET_STAGE_COPY[input.stage].label}` : ""}.`,
      },
    });
    const verifyToken = await signLeadVerifyToken(existing.id);
    const window = Math.floor(Date.now() / RESUBMIT_EMAIL_WINDOW_MS);
    const copy = EmailCopy.leadResubmitted(existing.fullName, verifyToken);
    try {
      await enqueueEmail({
        leadId: existing.id,
        eventType: "LEAD_RESUBMITTED",
        uniqueKey: emailUnique("LEAD_RESUBMITTED", `${existing.id}:${window}`),
        to: existing.email,
        subject: copy.subject,
        body: copy.body,
      });
    } catch (error) {
      // A concurrent resubmission already queued this window's confirmation e-mail.
      if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) throw error;
    }
    logInfo("lead_resubmitted", { leadId: existing.id });
    return { accessToken: null as string | null, leadId: null as string | null, created: false, tokenPreserved: true, verificationRequired: true };
  }

  const data = {
    fullName: input.fullName,
    email: input.email,
    whatsapp: phone,
    jobTitle,
    city: "NOT_PROVIDED",
    state: "NOT_PROVIDED",
    hasCompany: true,
    objectivesJson: JSON.stringify(input.interests),
    objectiveNotes: input.objective || null,
    beenToParaguay: relation.beenToParaguay,
    hasBusinessParaguay: relation.hasBusinessParaguay,
    hasPartnersParaguay: relation.hasPartnersParaguay,
    wantsOpenOperation: flags.wantsOpenOperation || relation.wantsOpenOperation,
    interestInvest: flags.interestInvest,
    interestNetworking: flags.interestNetworking,
    interestB2B: flags.interestB2B,
    interestIndustry: flags.interestIndustry,
    participateAlone: input.companionRequested !== true,
    companionCount: input.companionRequested ? 1 : 0,
    source: input.source || "interesse",
    companyStage: input.stage ?? null,
    qualificationJson: JSON.stringify(qualification),
    nextAction: "Agendar conversa com consultor",
  };

  const accessToken = newAccessToken();
  const lead = await prisma.lead.create({
    data: {
      ...data,
      accessTokenHash: sha256(accessToken),
      company: { create: { legalName: input.companyName, segment: input.segment } },
      status: "FORM_SUBMITTED",
      consents: {
        create: [
          {
            type: "PRIVACY_POLICY",
            version: PRIVACY_VERSION,
            accepted: true,
            ipHash: hashIp(meta.ip),
            userAgent: meta.userAgent?.slice(0, 240) || null,
          },
          {
            type: "TERMS",
            version: TERMS_VERSION,
            accepted: true,
            ipHash: hashIp(meta.ip),
            userAgent: meta.userAgent?.slice(0, 240) || null,
          },
          {
            type: "CONTACT",
            version: CONTACT_CONSENT_VERSION,
            accepted: true,
            ipHash: hashIp(meta.ip),
            userAgent: meta.userAgent?.slice(0, 240) || null,
          },
        ],
      },
      activities: {
        create: { type: "INTEREST_SUBMITTED", body: "Pré-inscrição conversacional recebida." },
      },
    },
  });
  await enqueueEmail({
    leadId: lead.id,
    eventType: "LEAD_CREATED",
    uniqueKey: emailUnique("LEAD_CREATED", lead.id),
    to: lead.email,
    subject: "Pré-inscrição recebida — Imersão Paraguai",
    body: `Olá, ${lead.fullName}.\n\nRecebemos seu perfil. Agende a conversa com um consultor para continuarmos.\n${appUrl()}/interesse`,
  });
  logInfo("lead_created", { leadId: lead.id });
  return { accessToken, leadId: lead.id as string | null, created: true, tokenPreserved: false, verificationRequired: false };
}

const leadInclude = {
  company: true,
  consultant: true,
  meetings: { orderBy: { scheduledAt: "desc" as const }, take: 1 },
  downloads: true,
};

export async function findLeadByToken(token: string) {
  return prisma.lead.findUnique({
    where: { accessTokenHash: sha256(token) },
    include: leadInclude,
  });
}

export async function findLeadById(id: string) {
  return prisma.lead.findUnique({ where: { id }, include: leadInclude });
}

export async function attachMeetingToLead(input: {
  token?: string;
  leadId?: string;
  calBookingUid?: string;
  scheduledAt?: string;
  consultantId?: string;
}) {
  const lead = input.token
    ? await findLeadByToken(input.token)
    : input.leadId
      ? await findLeadById(input.leadId)
      : null;
  if (!lead) throw new Error("LEAD_NOT_FOUND");

  const existingEarly = await prisma.meeting.findFirst({
    where: {
      status: { in: ["SCHEDULED", "CONFIRMED"] },
      OR: [
        input.calBookingUid ? { providerBookingUid: input.calBookingUid } : { id: "__none__" },
        input.scheduledAt && input.consultantId
          ? { leadId: lead.id, consultantId: input.consultantId, scheduledAt: new Date(input.scheduledAt) }
          : { id: "__none__" },
      ],
    },
    include: { consultant: true },
  });
  if (existingEarly) {
    if (existingEarly.leadId !== lead.id) throw new Error("SLOT_TAKEN");
    return confirmMeetingResponse({ lead, consultant: existingEarly.consultant, meeting: existingEarly });
  }

  const resolved = await resolveVerifiedBooking({
    calBookingUid: input.calBookingUid,
    scheduledAt: input.scheduledAt,
    consultantId: input.consultantId,
  });
  const consultant = await prisma.consultant.findUnique({ where: { id: resolved.consultantId } });
  if (!consultant) throw new Error("CONSULTANT_INACTIVE");
  const scheduledAt = resolved.booking.start;
  const durationMin = Math.max(15, Math.round((resolved.booking.end.getTime() - scheduledAt.getTime()) / 60000));
  const lockId = `${consultant.id}:${scheduledAt.toISOString()}`;
  const officialUrl = persistableMeetingUrl(resolved.booking.meetingUrl);

  const existing = await prisma.meeting.findFirst({
    where: {
      OR: [
        resolved.booking.uid ? { providerBookingUid: resolved.booking.uid } : { id: "__none__" },
        { leadId: lead.id, consultantId: consultant.id, scheduledAt, status: { in: ["SCHEDULED", "CONFIRMED"] } },
      ],
    },
  });
  if (existing) {
    if (existing.leadId !== lead.id) throw new Error("SLOT_TAKEN");
    if (officialUrl && officialUrl !== existing.meetingUrl) {
      await prisma.meeting.update({ where: { id: existing.id }, data: { meetingUrl: officialUrl } });
      existing.meetingUrl = officialUrl;
    }
    return confirmMeetingResponse({ lead, consultant, meeting: existing });
  }

  try {
    const meeting = await prisma.$transaction(async (tx) => {
      if (resolved.provider === "local") {
        await tx.slotLock.create({ data: { id: lockId } });
      }
      const created = await tx.meeting.create({
        data: {
          leadId: lead.id,
          consultantId: consultant.id,
          scheduledAt,
          durationMin,
          status: "SCHEDULED",
          meetingUrl: officialUrl,
          provider: resolved.provider,
          providerBookingUid: resolved.booking.uid,
        },
      });
      await tx.lead.update({
        where: { id: lead.id },
        data: {
          status: "MEETING_SCHEDULED",
          consultantId: consultant.id,
          nextAction: "Reunião comercial",
        },
      });
      await tx.activity.create({
        data: {
          leadId: lead.id,
          type: "CAL_BOOKING_CONFIRMED",
          body: `Reunião com ${consultant.name} em ${formatSaoPaulo(scheduledAt)}.`,
        },
      });
      return created;
    });
    return confirmMeetingResponse({ lead, consultant, meeting });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const raced = await prisma.meeting.findFirst({
        where: {
          OR: [
            resolved.booking.uid ? { providerBookingUid: resolved.booking.uid } : { id: "__none__" },
            { leadId: lead.id, consultantId: consultant.id, scheduledAt },
          ],
        },
      });
      if (raced && raced.leadId === lead.id) {
        return confirmMeetingResponse({ lead, consultant, meeting: raced });
      }
      throw new Error("SLOT_TAKEN");
    }
    throw error;
  }
}

async function confirmMeetingResponse(input: {
  lead: { id: string; fullName: string; email: string };
  consultant: { name: string };
  meeting: { id: string; scheduledAt: Date; meetingUrl: string };
}) {
  const live = officialMeetingUrl(input.meeting.meetingUrl);
  const copy = EmailCopy.meetingConfirmed(input.lead.fullName, input.consultant.name, input.meeting.scheduledAt, live);
  const queued = await enqueueEmail({
    leadId: input.lead.id,
    eventType: "MEETING_SCHEDULED",
    uniqueKey: emailUnique("MEETING_SCHEDULED", input.meeting.id),
    to: input.lead.email,
    subject: copy.subject,
    body: copy.body,
  });
  return {
    meetingId: input.meeting.id,
    leadId: input.lead.id,
    scheduledAt: input.meeting.scheduledAt,
    consultantName: input.consultant.name,
    meetingUrl: live,
    email: input.lead.email,
    emailStatus: emailDeliveryStatus(queued.status),
  };
}

export function publicLeadDTO(lead: NonNullable<Awaited<ReturnType<typeof findLeadByToken>>>) {
  const meeting = lead.meetings[0];
  return {
    name: lead.fullName,
    email: lead.email,
    consultantName: lead.consultant?.name ?? null,
    scheduledAt: meeting?.scheduledAt.toISOString() ?? null,
    meetingUrl: officialMeetingUrl(meeting?.meetingUrl),
    meetingStatus: meeting?.status ?? null,
    downloaded: lead.downloads.length > 0,
  };
}

export function staffLeadDTO(lead: {
  id: string;
  fullName: string;
  email: string;
  whatsapp: string;
  cpfLast4: string | null;
  city: string;
  state: string;
  jobTitle: string | null;
  status: string;
  source: string;
  companyStage?: string | null;
  objectivesJson: string;
  objectiveNotes: string | null;
  beenToParaguay: boolean | null;
  hasBusinessParaguay: boolean | null;
  hasPartnersParaguay: boolean | null;
  wantsOpenOperation: boolean | null;
  interestInvest: boolean | null;
  interestNetworking: boolean | null;
  interestB2B: boolean | null;
  interestIndustry: boolean | null;
  participateAlone: boolean;
  companionCount: number;
  nextAction: string | null;
  nextActionAt: Date | null;
  notes: string | null;
  createdAt: Date;
  company: { legalName: string; tradeName: string | null; taxId: string | null; segment: string | null } | null;
  consultant: { id: string; name: string } | null;
  meetings: { id: string; scheduledAt: Date; status: string; meetingUrl: string }[];
  downloads: { downloadedAt: Date }[];
  qualificationJson?: string;
}, role: string) {
  const meeting = lead.meetings[0];
  const showTax = canReadTax(role);
  return {
    id: lead.id,
    name: lead.fullName,
    email: lead.email,
    whatsapp: lead.whatsapp,
    cpfMasked: lead.cpfLast4 ? `***.***.***-${lead.cpfLast4}` : "—",
    city: lead.city,
    state: lead.state,
    jobTitle: lead.jobTitle,
    status: lead.status,
    source: lead.source,
    companyStage: lead.companyStage ?? null,
    objectives: JSON.parse(lead.objectivesJson) as string[],
    objectiveNotes: lead.objectiveNotes,
    beenToParaguay: lead.beenToParaguay,
    hasBusinessParaguay: lead.hasBusinessParaguay,
    hasPartnersParaguay: lead.hasPartnersParaguay,
    wantsOpenOperation: lead.wantsOpenOperation,
    interestInvest: lead.interestInvest,
    interestNetworking: lead.interestNetworking,
    interestB2B: lead.interestB2B,
    interestIndustry: lead.interestIndustry,
    participateAlone: lead.participateAlone,
    companionCount: lead.companionCount,
    nextAction: lead.nextAction,
    nextActionAt: lead.nextActionAt,
    notes: lead.notes,
    createdAt: lead.createdAt,
    companyName: lead.company?.tradeName || lead.company?.legalName || "—",
    cnpj: showTax ? lead.company?.taxId ?? "—" : lead.company?.taxId ? "••.•••.•••/••••-••" : "—",
    segment: lead.company?.segment ?? null,
    consultant: lead.consultant,
    meetingId: meeting?.id ?? null,
    meetingAt: meeting?.scheduledAt ?? null,
    meetingStatus: meeting?.status ?? null,
    meetingUrl: officialMeetingUrl(meeting?.meetingUrl),
    presentationDownloaded: lead.downloads.length > 0,
    lastDownloadAt: lead.downloads[0]?.downloadedAt ?? null,
    qualification: (() => {
      try {
        return JSON.parse(lead.qualificationJson || "{}") as Record<string, unknown>;
      } catch {
        return {};
      }
    })(),
  };
}

function canReadTax(role: string) {
  return can(role, "payment:write");
}
