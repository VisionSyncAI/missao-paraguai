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
  jobTitle: "Diretor(a) / C-Level" as const,
  jobTitleOther: "",
  companySize: "R$ 5 milhões – R$ 20 milhões" as const,
  interests: ["Expandir minha empresa"] as ["Expandir minha empresa"],
  objective: "",
  relationship: "Ainda não" as const,
  intent: "Quero conversar com um consultor" as const,
  consent: true as const,
  source: "test",
};

describe("lead captureInterest (db)", () => {
  it("primeiro submit cria token; reenvio preserva hash", async () => {
    const email = `lead.token.${Date.now()}@exemplo.com`;
    const first = await captureInterest({ ...payload, email }, { ip: "127.0.0.1", userAgent: "vitest" });
    expect(first.created).toBe(true);
    expect(first.accessToken).toBeTruthy();
    expect(first.tokenPreserved).toBe(false);
    const before = await prisma.lead.findUnique({ where: { id: first.leadId } });
    const second = await captureInterest({ ...payload, email, objective: "Atualizei o objetivo" }, { ip: "127.0.0.1", userAgent: "vitest" });
    expect(second.created).toBe(false);
    expect(second.tokenPreserved).toBe(true);
    expect(second.accessToken).toBeNull();
    const after = await prisma.lead.findUnique({ where: { id: first.leadId } });
    expect(after?.accessTokenHash).toBe(before?.accessTokenHash);
    expect(after?.city).toBe("NOT_PROVIDED");
    expect(after?.hasCompany).toBe(false);
    expect(after?.companyId).toBeNull();
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
          leadId: captured.leadId,
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
      leadId: captured.leadId,
      scheduledAt: slot.start,
      consultantId: slot.consultantId,
    });
    expect(second.meetingId).toBe(first.meetingId);
    expect(await prisma.meeting.count({ where: { leadId: captured.leadId } })).toBe(1);
    expect(await prisma.messageOutbox.count({ where: { uniqueKey: `MEETING_SCHEDULED:${first.meetingId}:email` } })).toBe(1);
  });

  it("booking inválido não cria Meeting", async () => {
    const email = `meet.fail.${Date.now()}@exemplo.com`;
    const captured = await captureInterest({ ...payload, email }, { ip: "127.0.0.1", userAgent: "vitest" });
    await expect(
      attachMeetingToLead({
        leadId: captured.leadId,
        scheduledAt: "2020-01-01T12:00:00.000Z",
        consultantId: "inexistente",
      }),
    ).rejects.toThrow();
    expect(await prisma.meeting.count({ where: { leadId: captured.leadId } })).toBe(0);
  });

  it("URL inválida não vira sala oficial", async () => {
    const fake = "http://localhost:3000/reuniao/cm-fake";
    expect(officialMeetingUrl(fake)).toBeNull();
    expect(officialMeetingUrl("https://evil.example/meet")).toBeNull();
    expect(officialMeetingUrl("https://meet.google.com/xxx-yyyy-zzz")).toBe("https://meet.google.com/xxx-yyyy-zzz");
  });
});
