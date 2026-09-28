import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { emailUnique, enqueueEmail } from "@/modules/comms/email";
import { EmailCopy } from "@/modules/comms/templates";
import { newAccessToken, sha256 } from "@/lib/crypto";
import { PRIVACY_VERSION, TERMS_VERSION } from "@/modules/leads/status";

export async function createRegistrationFromLead(leadId: string, actorId?: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { company: true },
  });
  if (!lead) throw new Error("LEAD_NOT_FOUND");
  if (lead.status !== "WON") throw new Error("LEAD_NOT_WON");

  const existing = await prisma.registration.findUnique({ where: { leadId } });
  if (existing) return { registration: existing, accessToken: null as string | null };

  const companionEnabled = await prisma.businessSetting.findUnique({ where: { key: "COMPANION_FEATURE" } });
  const companionsAllowed = companionEnabled?.value === "enabled";

  const registration = await prisma.registration.create({
    data: {
      leadId: lead.id,
      status: "DRAFT",
      fullName: lead.fullName,
      email: lead.email,
      phone: lead.whatsapp,
      jobTitle: lead.jobTitle,
      cpfLast4: lead.cpfLast4,
      companyName: lead.company?.tradeName || lead.company?.legalName,
      companyTaxId: lead.company?.taxId,
      segment: lead.company?.segment,
      interestsJson: lead.objectivesJson,
      objectives: lead.objectiveNotes,
      dietaryNotes: lead.dietaryNotes,
      companionIntent: companionsAllowed ? !lead.participateAlone : false,
      companionCount: companionsAllowed ? lead.companionCount : 0,
      termsVersion: TERMS_VERSION,
      privacyVersion: PRIVACY_VERSION,
    },
  });

  await prisma.activity.create({
    data: { leadId, type: "REGISTRATION_CREATED", body: "Ficha de inscrição criada após WON.", actorId },
  });
  await writeAudit({ actorId, action: "REGISTRATION_CREATED", resource: "Registration", resourceId: registration.id });

  const token = newAccessToken();
  await prisma.participant.create({
    data: {
      registrationId: registration.id,
      accessTokenHash: sha256(token),
      status: "PENDING_PAYMENT",
    },
  });

  const copy = EmailCopy.registrationCreated(lead.fullName, token);
  await enqueueEmail({
    leadId,
    eventType: "REGISTRATION_CREATED",
    uniqueKey: emailUnique("REGISTRATION_CREATED", registration.id),
    to: lead.email,
    subject: copy.subject,
    body: copy.body,
  });

  return { registration, accessToken: token };
}

export async function updateRegistration(id: string, data: {
  jobTitle?: string;
  objectives?: string;
  networkingNotes?: string;
  dietaryNotes?: string;
  arrivalNotes?: string;
  departureNotes?: string;
  status?: string;
}) {
  const current = await prisma.registration.findUnique({ where: { id } });
  if (!current) throw new Error("NOT_FOUND");
  if (["CANCELED", "EXPIRED"].includes(current.status)) throw new Error("REGISTRATION_LOCKED");
  const status = data.status && ["DRAFT", "SUBMITTED", "CANCELED"].includes(data.status) ? data.status : current.status;
  return prisma.registration.update({
    where: { id },
    data: {
      jobTitle: data.jobTitle ?? current.jobTitle,
      objectives: data.objectives ?? current.objectives,
      networkingNotes: data.networkingNotes ?? current.networkingNotes,
      dietaryNotes: data.dietaryNotes ?? current.dietaryNotes,
      arrivalNotes: data.arrivalNotes ?? current.arrivalNotes,
      departureNotes: data.departureNotes ?? current.departureNotes,
      status,
    },
  });
}
