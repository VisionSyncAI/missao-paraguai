import { describe, expect, it } from "vitest";
import { can } from "../src/lib/rbac";
import { quoteOrder } from "../src/modules/catalog/pricing";
import { canAssignSeat, nextAssignmentStatus } from "../src/modules/cohorts/capacity";
import { canReadDocument, validateUpload } from "../src/modules/documents/rules";
import { canTransitionLead } from "../src/modules/leads/status";
import { overlaps } from "../src/modules/events/rules";
import { paymentConfigured } from "../src/modules/billing/provider";

describe("RBAC", () => {
  it("FINANCE não escreve documento nem turma", () => {
    expect(can("FINANCE", "payment:write")).toBe(true);
    expect(can("FINANCE", "document:write")).toBe(false);
    expect(can("FINANCE", "cohort:write")).toBe(false);
  });
  it("COMMERCIAL não aprova documento", () => {
    expect(can("COMMERCIAL", "proposal:write")).toBe(true);
    expect(can("COMMERCIAL", "document:write")).toBe(false);
  });
  it("OPERATIONS não cria pedido", () => {
    expect(can("OPERATIONS", "event:write")).toBe(true);
    expect(can("OPERATIONS", "order:write")).toBe(false);
  });
});

describe("preço servidor", () => {
  it("bloqueia quote sem preço oficial", () => {
    const quote = quoteOrder({
      officialAmountCents: null,
      officialPriceVersionId: null,
      productId: "p1",
      productCode: "EXECUTIVE",
      productName: "Executive",
    });
    expect(quote.blocked).toBe("BLOCKED_BY_BUSINESS_DECISION");
  });
  it("calcula total sem aceitar valor do frontend", () => {
    const quote = quoteOrder({
      officialAmountCents: 1999700,
      officialPriceVersionId: "pv1",
      productId: "p1",
      productCode: "EXECUTIVE",
      productName: "Executive",
      discountBps: 0,
    });
    expect("totalCents" in quote && quote.totalCents).toBe(1999700);
  });
});

describe("capacidade", () => {
  it("14 ocupadas + capacidade 15 permite; 15 não", () => {
    expect(canAssignSeat(14, 15)).toBe(true);
    expect(nextAssignmentStatus(15, 15)).toBe("WAITLIST");
  });
});

describe("IDOR documentos", () => {
  it("participante A não lê documento de B", () => {
    expect(
      canReadDocument({
        sessionParticipantId: "A",
        sessionRegistrationId: "RA",
        documentParticipantId: "B",
        documentRegistrationId: "RB",
      }),
    ).toBe(false);
  });
  it("participante lê o próprio", () => {
    expect(
      canReadDocument({
        sessionParticipantId: "A",
        sessionRegistrationId: "RA",
        documentParticipantId: "A",
        documentRegistrationId: "RA",
      }),
    ).toBe(true);
  });
});

describe("upload", () => {
  it("rejeita exe e aceita pdf", () => {
    expect(() => validateUpload({ mimeType: "application/x-msdownload", sizeBytes: 10, name: "a.exe" })).toThrow();
    expect(validateUpload({ mimeType: "application/pdf", sizeBytes: 10, name: "passaporte.pdf" })).toBe(".pdf");
  });
});

describe("funil e agenda", () => {
  it("PROPOSAL pode ir a WON", () => {
    expect(canTransitionLead("PROPOSAL", "WON")).toBe(true);
    expect(canTransitionLead("FORM_SUBMITTED", "WON")).toBe(false);
  });
  it("detecta conflito de horário", () => {
    const a = new Date("2026-10-01T10:00:00Z");
    const b = new Date("2026-10-01T11:00:00Z");
    const c = new Date("2026-10-01T10:30:00Z");
    const d = new Date("2026-10-01T11:30:00Z");
    expect(overlaps(a, b, c, d)).toBe(true);
    expect(overlaps(a, b, new Date("2026-10-01T11:00:00Z"), new Date("2026-10-01T12:00:00Z"))).toBe(false);
  });
});

describe("pagamento produção", () => {
  it("sem PAYMENT_PROVIDER não está configurado", () => {
    expect(paymentConfigured()).toBe(false);
  });
});
