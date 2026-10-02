import { describe, expect, it } from "vitest";
import { isLiveMeetingLink, officialMeetingUrl } from "../src/lib/meetingLink";
import { emailDeliveryStatus } from "../src/modules/comms/email";
import { EmailCopy } from "../src/modules/comms/templates";
import { formatSaoPaulo } from "../src/lib/timezone";
import { bookingHorizonDays, compareYmd, BOOKING_LAST_YMD } from "../src/modules/meetings/window";
import { groupSlotsByDay } from "../src/components/commercial/SlotPicker";
import { captureSchema } from "../src/modules/leads/captureSchema";
import {
  emptyDraft,
  interesseHref,
  mapInterestFlags,
  mapRelationship,
  normalizeName,
  parseUtm,
  validateStep,
} from "../src/modules/interest/flow";

describe("CTA e UTM", () => {
  it("preserva apenas UTM em /interesse", () => {
    expect(interesseHref("?utm_source=instagram&utm_campaign=missao&foo=1")).toBe(
      "/interesse?utm_source=instagram&utm_campaign=missao",
    );
    expect(interesseHref("")).toBe("/interesse");
  });
  it("não coloca e-mail na query", () => {
    expect(interesseHref("?email=a@b.com")).toBe("/interesse");
    expect(parseUtm("?utm_medium=social").utm_medium).toBe("social");
  });
});

describe("validação conversacional", () => {
  it("nome exige mínimo e normaliza espaços", () => {
    expect(normalizeName("  Ana   Silva  ")).toBe("Ana Silva");
    const draft = { ...emptyDraft(), fullName: "Ana" };
    expect(validateStep("name", draft)).toBeTruthy();
    expect(validateStep("name", { ...draft, fullName: "Ana Souza" })).toBeNull();
  });
  it("contato valida e-mail e whatsapp", () => {
    const draft = { ...emptyDraft(), email: "x", whatsapp: "123" };
    expect(validateStep("contact", draft)).toBeTruthy();
    expect(validateStep("contact", { ...draft, email: "ana@empresa.com", whatsapp: "11999999999" })).toBeNull();
  });
  it("objetivo é opcional", () => {
    expect(validateStep("objective", emptyDraft())).toBeNull();
  });
  it("consentimento obrigatório", () => {
    expect(validateStep("consent", emptyDraft())).toBeTruthy();
    expect(validateStep("consent", { ...emptyDraft(), consent: true })).toBeNull();
  });
});

describe("qualificação estruturada", () => {
  it("mapeia relação sem virar preço", () => {
    expect(mapRelationship("Já faço negócios").hasBusinessParaguay).toBe(true);
    expect(mapRelationship("Ainda não").beenToParaguay).toBe(false);
  });
  it("mapeia interesses para flags", () => {
    const flags = mapInterestFlags(["Investimentos", "Conhecer oportunidades na indústria"]);
    expect(flags.interestInvest).toBe(true);
    expect(flags.interestIndustry).toBe(true);
  });
});

describe("janela de reunião", () => {
  it("inclui 15 de novembro de 2026 como último dia de agenda", () => {
    expect(compareYmd(BOOKING_LAST_YMD, { year: 2026, month: 11, day: 15 })).toBe(0);
    const from = new Date("2026-09-28T12:00:00-03:00");
    expect(bookingHorizonDays(from)).toBeGreaterThan(14);
    expect(bookingHorizonDays(from)).toBe(49);
  });
  it("agrupa horários por dia", () => {
    const groups = groupSlotsByDay([
      { start: "2026-11-15T12:00:00.000Z", consultantId: "c", consultantName: "K" },
      { start: "2026-11-15T13:00:00.000Z", consultantId: "c", consultantName: "K" },
      { start: "2026-11-14T12:00:00.000Z", consultantId: "c", consultantName: "K" },
    ]);
    expect(groups).toHaveLength(2);
  });
  it("formata reunião com timezone fixo America/Sao_Paulo", () => {
    const text = formatSaoPaulo(new Date("2026-11-15T13:30:00.000Z"));
    expect(text).toContain("15 de novembro de 2026");
    expect(text).toContain("10:30");
    expect(formatSaoPaulo(new Date("2026-11-15T13:30:00.000Z"))).toBe(text);
  });
  it("não trata /reuniao/id como link de sala ao vivo", () => {
    expect(isLiveMeetingLink("http://localhost:3000/reuniao/abc")).toBe(false);
    expect(isLiveMeetingLink("https://meet.google.com/xxx")).toBe(true);
    expect(isLiveMeetingLink("")).toBe(false);
  });
  it("só aceita sala oficial https de provedor conhecido", () => {
    expect(officialMeetingUrl("https://meet.google.com/abc-defg-hij")).toBe("https://meet.google.com/abc-defg-hij");
    expect(officialMeetingUrl("https://us06web.zoom.us/j/123")).toBe("https://us06web.zoom.us/j/123");
    expect(officialMeetingUrl("https://teams.microsoft.com/l/meetup-join/x")).toContain("teams.microsoft.com");
    expect(officialMeetingUrl("https://example.com/sala")).toBeNull();
    expect(officialMeetingUrl("http://meet.google.com/xxx")).toBeNull();
    expect(officialMeetingUrl("https://app.local/reuniao/cm123")).toBeNull();
    expect(officialMeetingUrl("pending")).toBeNull();
    expect(officialMeetingUrl("integrations:google:meet")).toBeNull();
  });
  it("mapeia status de e-mail sem fingir envio Resend", () => {
    expect(emailDeliveryStatus("SENT")).toBe("sent");
    expect(emailDeliveryStatus("FAILED")).toBe("failed");
    expect(emailDeliveryStatus("DEV_LOGGED")).toBe("queued");
    expect(emailDeliveryStatus("PENDING")).toBe("queued");
  });
  it("template de reunião confirmada não inventa sala", () => {
    const when = new Date("2026-11-15T13:30:00.000Z");
    const queued = EmailCopy.meetingConfirmed("Ana Souza", "Karina Ferreira", when, null);
    expect(queued.subject).toBe("Imersão Paraguai — reunião confirmada");
    expect(queued.body).toContain("O consultor vai chamar você pelo WhatsApp informado no horário marcado.");
    expect(queued.body).not.toMatch(/link da reunião será enviado/i);
    expect(queued.body).not.toContain("/reuniao/");
    expect(queued.body).toContain("caixa de spam");
    const live = EmailCopy.meetingConfirmed("Ana Souza", "Karina Ferreira", when, "https://meet.google.com/abc");
    expect(live.body).toContain("Entrar na reunião:");
    expect(live.body).toContain("https://meet.google.com/abc");
  });
});

describe("schema de captação", () => {
  it("aceita payload mínimo e rejeita sem consentimento", () => {
    const base = {
      fullName: "Ana Souza Lima",
      email: "ana@empresa.com",
      whatsapp: "11988887777",
      jobTitle: "CEO / Presidente",
      companySize: "R$ 5 milhões – R$ 20 milhões",
      interests: ["Expandir minha empresa"],
      relationship: "Ainda não",
      intent: "Quero conversar com um consultor",
      consent: true,
    };
    expect(captureSchema.safeParse(base).success).toBe(true);
    expect(captureSchema.safeParse({ ...base, consent: false }).success).toBe(false);
    expect(captureSchema.safeParse({ ...base, email: "invalido" }).success).toBe(false);
  });
});
