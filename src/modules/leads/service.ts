import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashIp, newAccessToken, sha256 } from "@/lib/crypto";
import { onlyDigits } from "@/lib/validation/br";
import { CONTACT_CONSENT_VERSION, PRIVACY_VERSION, TERMS_VERSION } from "@/modules/leads/status";
import { formatSaoPaulo } from "@/lib/timezone";
import { emailUnique, enqueueEmail } from "@/modules/comms/email";
import { EmailCopy } from "@/modules/comms/templates";
import type { InterestInput } from "@/modules/leads/schema";
import { logInfo } from "@/lib/logger";
import { resolveVerifiedBooking } from "@/modules/scheduling/resolve";

function appUrl() {
  return process.env.APP_URL || "http://localhost:3000";
}

function meetingUrl(meetingId: string) {
  return `${appUrl()}/reuniao/${meetingId}`;
}

async function pickCompany(input: InterestInput) {
  if (!input.hasCompany || !input.legalName) return null;
  const taxId = input.cnpj ? onlyDigits(input.cnpj) : null;
  if (taxId) {
    const existing = await prisma.company.findUnique({ where: { taxId } });
    if (existing) {
      return prisma.company.update({
        where: { id: existing.id },
        data: {
          legalName: input.legalName,
          tradeName: input.tradeName || existing.tradeName,
          type: input.companyType || existing.type,
          segment: input.segment || existing.segment,
          employeeBand: input.employeeBand || existing.employeeBand,
          city: input.companyCity || existing.city,
          state: input.companyState || existing.state,
          website: input.website || existing.website,
          social: input.social || existing.social,
        },
      });
    }
  }
  return prisma.company.create({
    data: {
      taxId,
      legalName: input.legalName,
      tradeName: input.tradeName || null,
      type: input.companyType || null,
      segment: input.segment || null,
      employeeBand: input.employeeBand || null,
      city: input.companyCity || null,
      state: input.companyState || null,
      website: input.website || null,
      social: input.social || null,
    },
  });
}

export async function submitInterest(input: InterestInput, meta: { ip: string | null; userAgent: string | null; source?: string }) {
  const resolved = await resolveVerifiedBooking({
    calBookingUid: input.calBookingUid || undefined,
    scheduledAt: input.scheduledAt || undefined,
    consultantId: input.consultantId || undefined,
  });
  const consultant = await prisma.consultant.findUnique({ where: { id: resolved.consultantId } });
  if (!consultant) throw new Error("CONSULTANT_INACTIVE");
  const scheduledAt = resolved.booking.start;
  const durationMin = Math.max(15, Math.round((resolved.booking.end.getTime() - scheduledAt.getTime()) / 60000));

  const company = await pickCompany(input);
  const accessToken = newAccessToken();
  const lockId = `${consultant.id}:${scheduledAt.toISOString()}`;
  const cpfDigits = input.cpf ? onlyDigits(input.cpf) : "";

  try {
    const created = await prisma.$transaction(async (tx) => {
      if (resolved.provider === "local") {
        await tx.slotLock.create({ data: { id: lockId } });
      }

      const lead = await tx.lead.create({
        data: {
          accessTokenHash: sha256(accessToken),
          status: "MEETING_SCHEDULED",
          source: input.source || meta.source || "landing",
          fullName: input.fullName,
          email: input.email,
          whatsapp: onlyDigits(input.whatsapp),
          altPhone: input.altPhone ? onlyDigits(input.altPhone) : null,
          cpfHash: cpfDigits ? sha256(cpfDigits) : null,
          cpfLast4: cpfDigits ? cpfDigits.slice(-4) : null,
          birthDate: input.birthDate || null,
          city: input.city,
          state: input.state,
          country: input.country,
          jobTitle: input.jobTitle || null,
          hasCompany: input.hasCompany,
          companyId: company?.id,
          objectivesJson: JSON.stringify(input.objectives),
          objectiveNotes: input.objectiveNotes || null,
          beenToParaguay: input.beenToParaguay ?? null,
          hasBusinessParaguay: input.hasBusinessParaguay ?? null,
          hasPartnersParaguay: input.hasPartnersParaguay ?? null,
          wantsOpenOperation: input.wantsOpenOperation ?? null,
          hasInternationalOps: input.hasInternationalOps ?? null,
          interestInvest: input.interestInvest ?? null,
          interestNetworking: input.interestNetworking ?? null,
          interestB2B: input.interestB2B ?? null,
          interestIndustry: input.interestIndustry ?? null,
          participateAlone: input.participateAlone,
          companionCount: input.participateAlone ? 0 : input.companions.length,
          dietaryRestricted: input.dietaryRestricted ?? null,
          dietaryNotes: input.dietaryRestricted ? input.dietaryNotes || null : null,
          specialNeeds: input.specialNeeds || null,
          consultantId: consultant.id,
          companions: input.participateAlone
            ? undefined
            : {
                create: input.companions.map((c) => ({
                  fullName: c.fullName,
                  relationType: c.relationType,
                  email: c.email || null,
                  whatsapp: c.whatsapp ? onlyDigits(c.whatsapp) : null,
                })),
              },
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
        },
      });

      const meeting = await tx.meeting.create({
        data: {
          leadId: lead.id,
          consultantId: consultant.id,
          scheduledAt,
          durationMin,
          status: "SCHEDULED",
          meetingUrl: resolved.booking.meetingUrl || meetingUrl("pending"),
          provider: resolved.provider,
          providerBookingUid: resolved.booking.uid,
        },
      });

      const url = resolved.booking.meetingUrl || meetingUrl(meeting.id);
      if (url !== meeting.meetingUrl) {
        await tx.meeting.update({ where: { id: meeting.id }, data: { meetingUrl: url } });
      }

      await tx.activity.createMany({
        data: [
          { leadId: lead.id, type: "FORM_SUBMITTED", body: "Formulário de interesse enviado." },
          { leadId: lead.id, type: "MEETING_SCHEDULED", body: `Reunião com ${consultant.name} em ${formatSaoPaulo(scheduledAt)}.` },
          { leadId: lead.id, type: "PRESENTATION_AVAILABLE", body: "Apresentação executiva disponibilizada." },
        ],
      });

      return { lead, meeting: { ...meeting, meetingUrl: url } };
    });

    const copy = EmailCopy.leadReceived(
      created.lead.fullName,
      consultant.name,
      scheduledAt,
      created.meeting.meetingUrl,
      accessToken,
    );
    await enqueueEmail({
      leadId: created.lead.id,
      eventType: "LEAD_CREATED",
      uniqueKey: emailUnique("LEAD_CREATED", created.lead.id),
      to: created.lead.email,
      subject: copy.subject,
      body: copy.body,
    });
    await enqueueEmail({
      leadId: created.lead.id,
      eventType: "MEETING_SCHEDULED",
      uniqueKey: emailUnique("MEETING_SCHEDULED", created.meeting.id),
      to: created.lead.email,
      subject: "Reunião agendada — Imersão Paraguai",
      body: copy.body,
    });

    logInfo("lead_created", { leadId: created.lead.id, consultantId: consultant.id });
    return { accessToken, leadId: created.lead.id, meetingId: created.meeting.id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("SLOT_TAKEN");
    }
    throw error;
  }
}

export async function findLeadByToken(token: string) {
  return prisma.lead.findUnique({
    where: { accessTokenHash: sha256(token) },
    include: {
      company: true,
      consultant: true,
      meetings: { orderBy: { scheduledAt: "desc" }, take: 1 },
      downloads: true,
    },
  });
}

export function publicLeadDTO(lead: NonNullable<Awaited<ReturnType<typeof findLeadByToken>>>) {
  const meeting = lead.meetings[0];
  return {
    name: lead.fullName,
    email: lead.email,
    consultantName: lead.consultant?.name ?? null,
    scheduledAt: meeting?.scheduledAt.toISOString() ?? null,
    meetingUrl: meeting?.meetingUrl ?? null,
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
}, role: string) {
  const meeting = lead.meetings[0];
  const showTax = role === "ADMIN" || role === "FINANCE";
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
    meetingUrl: meeting?.meetingUrl ?? null,
    presentationDownloaded: lead.downloads.length > 0,
    lastDownloadAt: lead.downloads[0]?.downloadedAt ?? null,
  };
}
