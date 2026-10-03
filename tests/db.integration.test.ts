import { PrismaClient } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { attachMeetingToLead, captureInterest } from "../src/modules/leads/service";
import { listAvailableSlots } from "../src/modules/meetings/availability";
import { officialMeetingUrl } from "../src/lib/meetingLink";
import { allowLocalScheduler } from "../src/modules/scheduling/config";
import { assignPaidParticipant } from "../src/modules/cohorts/assign";

const prisma = new PrismaClient();

const payload = {
  fullName: "Maria Silva Teste",
  email: "",
  whatsapp: "11988887777",
  companyName: "Metalúrgica Teste Ltda",
  segment: "Indústria" as const,
  lot: "01" as const,
  jobTitle: "Diretor(a) / C-Level" as const,
  jobTitleOther: "",
  companySize: "R$ 5 milhões – R$ 20 milhões" as const,
  interests: ["Expansão", "B2B"] as ("Expansão" | "B2B")[],
  objective: "",
  relationship: "Ainda não" as const,
  intent: "Quero conversar com um consultor" as const,
  consent: true as const,
  source: "test",
};

describe("lead captureInterest (db)", () => {
  it("grava estagio_empresa e a origem da seção de mercado para segmentação", async () => {
    const email = `lead.stage.${Date.now()}@exemplo.com`;
    const res = await captureInterest(
      { ...payload, email, stage: "AVALIANDO", source: "interesse-mercado", interests: ["Tributação", "Maquila"] },
      { ip: "127.0.0.1", userAgent: "vitest" },
    );
    const lead = await prisma.lead.findUnique({ where: { id: res.leadId! } });
    expect(lead?.companyStage).toBe("AVALIANDO");
    expect(lead?.source).toBe("interesse-mercado");
    expect(JSON.parse(lead!.qualificationJson).seeking).toEqual(["Tributação", "Maquila"]);
    expect(await prisma.lead.count({ where: { companyStage: "AVALIANDO", id: res.leadId! } })).toBe(1);
  });

  it("primeiro submit cria token; reenvio com o mesmo e-mail não altera nem expõe o lead", async () => {
    const email = `lead.token.${Date.now()}@exemplo.com`;
    const first = await captureInterest({ ...payload, email }, { ip: "127.0.0.1", userAgent: "vitest" });
    expect(first.created).toBe(true);
    expect(first.accessToken).toBeTruthy();
    expect(first.leadId).toBeTruthy();
    expect(first.tokenPreserved).toBe(false);
    const created = await prisma.lead.findUnique({ where: { id: first.leadId! }, include: { company: true } });
    expect(created?.company?.legalName).toBe("Metalúrgica Teste Ltda");
    expect(created?.company?.segment).toBe("Indústria");
    expect(created?.interestB2B).toBe(true);
    expect(created?.wantsOpenOperation).toBe(true);
    const qualification = JSON.parse(created!.qualificationJson);
    expect(qualification.lotOfInterest).toBe("01");
    expect(qualification.seeking).toEqual(["Expansão", "B2B"]);
    const before = await prisma.lead.findUnique({ where: { id: first.leadId! } });
    const second = await captureInterest(
      { ...payload, email, fullName: "Atacante Qualquer", whatsapp: "11911112222", objective: "Atualizei o objetivo" },
      { ip: "10.0.0.9", userAgent: "attacker" },
    );
    expect(second.created).toBe(false);
    expect(second.verificationRequired).toBe(true);
    expect(second.accessToken).toBeNull();
    expect(second.leadId).toBeNull();
    const after = await prisma.lead.findUnique({ where: { id: first.leadId! } });
    expect(after?.accessTokenHash).toBe(before?.accessTokenHash);
    expect(after?.fullName).toBe(before?.fullName);
    expect(after?.whatsapp).toBe(before?.whatsapp);
    expect(after?.objectiveNotes).toBe(before?.objectiveNotes);
    expect(after?.qualificationJson).toBe(before?.qualificationJson);
    expect(after?.updatedAt.getTime()).toBe(before?.updatedAt.getTime());
    const resubmitted = await prisma.activity.findFirst({ where: { leadId: first.leadId!, type: "INTEREST_RESUBMITTED" } });
    expect(resubmitted).toBeTruthy();
    const confirmation = await prisma.messageOutbox.findFirst({ where: { leadId: first.leadId!, eventType: "LEAD_RESUBMITTED" } });
    expect(confirmation?.toAddress).toBe(email);
    expect(confirmation?.body).toContain("/api/leads/verify?t=");
    expect(await prisma.lead.count({ where: { email } })).toBe(1);
  });

  it("reenvios concorrentes com o mesmo e-mail não sobrescrevem o lead", async () => {
    const email = `lead.race.${Date.now()}@exemplo.com`;
    const first = await captureInterest({ ...payload, email }, { ip: "127.0.0.1", userAgent: "vitest" });
    const before = await prisma.lead.findUnique({ where: { id: first.leadId! } });
    const results = await Promise.all(
      [1, 2, 3, 4, 5].map((n) =>
        captureInterest({ ...payload, email, fullName: `Concorrente ${n} Teste`, whatsapp: `1199999000${n}` }, { ip: `10.0.0.${n}`, userAgent: "race" }),
      ),
    );
    expect(results.every((r) => !r.created && r.leadId === null && r.accessToken === null)).toBe(true);
    const after = await prisma.lead.findUnique({ where: { id: first.leadId! } });
    expect(after?.fullName).toBe(before?.fullName);
    expect(after?.whatsapp).toBe(before?.whatsapp);
    expect(await prisma.lead.count({ where: { email } })).toBe(1);
  });
});

describe("cohort assign (db)", () => {
  it("capacidade 1 não overbooka; segundo vai waitlist", async () => {
    const stamp = Date.now();
    const edition = await prisma.edition.create({ data: { name: `ed-test-${stamp}`, status: "OPEN" } });
    const cohort = await prisma.cohort.create({
      data: { editionId: edition.id, name: `co-test-${stamp}`, capacity: 1, seatsTaken: 0, status: "OPEN", isPublic: false },
    });
    const leads = await Promise.all(
      [1, 2].map((n) =>
        prisma.lead.create({
          data: {
            fullName: `Pessoa ${n}`,
            email: `cohort.${stamp}.${n}@exemplo.com`,
            whatsapp: "11999999999",
            city: "NOT_PROVIDED",
            state: "—",
            hasCompany: false,
            accessTokenHash: `test-hash-${stamp}-${n}`,
          },
        }),
      ),
    );
    const regs = await Promise.all(
      leads.map((lead) =>
        prisma.registration.create({
          data: { leadId: lead.id, fullName: lead.fullName, email: lead.email, phone: lead.whatsapp },
        }),
      ),
    );
    const first = await assignPaidParticipant(regs[0].id, cohort.id);
    const second = await assignPaidParticipant(regs[1].id, cohort.id);
    const after = await prisma.cohort.findUnique({ where: { id: cohort.id } });
    expect(first.status).toBe("CONFIRMED");
    expect(second.status).toBe("WAITLIST");
    expect(after?.seatsTaken).toBe(1);
    expect(after?.seatsTaken).toBeLessThanOrEqual(after!.capacity);
  });

  it("requisições paralelas não ultrapassam capacity", async () => {
    const stamp = Date.now();
    const edition = await prisma.edition.create({ data: { name: `ed-race-${stamp}`, status: "OPEN" } });
    const cohort = await prisma.cohort.create({
      data: { editionId: edition.id, name: `co-race-${stamp}`, capacity: 3, seatsTaken: 0, status: "OPEN", isPublic: false },
    });
    const leads = await Promise.all(
      Array.from({ length: 8 }, (_, n) =>
        prisma.lead.create({
          data: {
            fullName: `Race ${n}`,
            email: `race.${stamp}.${n}@exemplo.com`,
            whatsapp: "11999999999",
            city: "NOT_PROVIDED",
            state: "NOT_PROVIDED",
            hasCompany: false,
            accessTokenHash: `race-hash-${stamp}-${n}`,
          },
        }),
      ),
    );
    const regs = await Promise.all(
      leads.map((lead) =>
        prisma.registration.create({
          data: { leadId: lead.id, fullName: lead.fullName, email: lead.email, phone: lead.whatsapp },
        }),
      ),
    );
    const results = await Promise.allSettled(regs.map((reg) => assignPaidParticipant(reg.id, cohort.id)));
    const confirmed = results.filter((r) => r.status === "fulfilled" && r.value.status === "CONFIRMED").length;
    const after = await prisma.cohort.findUnique({ where: { id: cohort.id } });
    expect(after?.seatsTaken).toBeLessThanOrEqual(3);
    expect(confirmed).toBeLessThanOrEqual(3);
  });
});

describe("attachMeetingToLead (db)", () => {
  it("confirma booking local sem sala oficial e não duplica Meeting/e-mail", async () => {
    if (!allowLocalScheduler()) return;
    const email = `meet.ok.${Date.now()}@exemplo.com`;
    const captured = await captureInterest({ ...payload, email }, { ip: "127.0.0.1", userAgent: "vitest" });
    const slots = await listAvailableSlots();
    expect(slots.length).toBeGreaterThan(0);
    let first: Awaited<ReturnType<typeof attachMeetingToLead>> | null = null;
    let slot = slots[0];
    for (const candidate of slots) {
      try {
        first = await attachMeetingToLead({
          leadId: captured.leadId!,
          scheduledAt: candidate.start,
          consultantId: candidate.consultantId,
        });
        slot = candidate;
        break;
      } catch (error) {
        if (!(error instanceof Error) || error.message !== "SLOT_TAKEN") throw error;
      }
    }
    expect(first).toBeTruthy();
    if (!first) throw new Error("no free slot");
    expect(first.meetingUrl).toBeNull();
    expect(first.email).toBe(email);
    expect(first.emailStatus).toBe("queued");
    expect(officialMeetingUrl(first.meetingUrl)).toBeNull();
    const stored = await prisma.meeting.findUnique({ where: { id: first.meetingId } });
    expect(stored?.meetingUrl).toBe("");
    const second = await attachMeetingToLead({
      leadId: captured.leadId!,
      scheduledAt: slot.start,
      consultantId: slot.consultantId,
    });
    expect(second.meetingId).toBe(first.meetingId);
    expect(await prisma.meeting.count({ where: { leadId: captured.leadId! } })).toBe(1);
    expect(await prisma.messageOutbox.count({ where: { uniqueKey: `MEETING_SCHEDULED:${first.meetingId}:email` } })).toBe(1);
  });

  it("booking inválido não cria Meeting", async () => {
    const email = `meet.fail.${Date.now()}@exemplo.com`;
    const captured = await captureInterest({ ...payload, email }, { ip: "127.0.0.1", userAgent: "vitest" });
    await expect(
      attachMeetingToLead({
        leadId: captured.leadId!,
        scheduledAt: "2020-01-01T12:00:00.000Z",
        consultantId: "inexistente",
      }),
    ).rejects.toThrow();
    expect(await prisma.meeting.count({ where: { leadId: captured.leadId! } })).toBe(0);
  });

  it("URL inválida não vira sala oficial", async () => {
    const fake = "http://localhost:3000/reuniao/cm-fake";
    expect(officialMeetingUrl(fake)).toBeNull();
    expect(officialMeetingUrl("https://evil.example/meet")).toBeNull();
    expect(officialMeetingUrl("https://meet.google.com/xxx-yyyy-zzz")).toBe("https://meet.google.com/xxx-yyyy-zzz");
  });
});
