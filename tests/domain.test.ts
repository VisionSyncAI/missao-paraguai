import { describe, expect, it } from "vitest";
import { isValidCnpj, isValidCpf, normalizePhone } from "../src/lib/validation/br";
import { canTransitionLead } from "../src/modules/leads/status";
import { slotFitsAvailability } from "../src/modules/meetings/rules";
import { mapCalTriggerToMeetingStatus } from "../src/modules/scheduling/types";
import { verifyCalSignature } from "../src/modules/scheduling/signature";

describe("CPF/CNPJ", () => {
  it("aceita CPF válido e rejeita repetição", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCpf("123")).toBe(false);
  });
  it("aceita CNPJ válido", () => {
    expect(isValidCnpj("04.252.011/0001-10")).toBe(true);
    expect(isValidCnpj("00.000.000/0000-00")).toBe(false);
  });
  it("normaliza telefone", () => {
    expect(normalizePhone("(11) 99999-9999")).toBe("11999999999");
    expect(normalizePhone("123")).toBeNull();
  });
});

describe("pipeline", () => {
  it("bloqueia salto FORM_SUBMITTED -> WON", () => {
    expect(canTransitionLead("FORM_SUBMITTED", "WON")).toBe(false);
  });
  it("permite reunião agendada para realizada e lost", () => {
    expect(canTransitionLead("MEETING_SCHEDULED", "MEETING_COMPLETED")).toBe(true);
    expect(canTransitionLead("NEGOTIATION", "WON")).toBe(true);
  });
});

describe("cal.diy", () => {
  it("mapeia triggers para status de Meeting", () => {
    expect(mapCalTriggerToMeetingStatus("BOOKING_CREATED")).toBe("SCHEDULED");
    expect(mapCalTriggerToMeetingStatus("BOOKING_CANCELLED")).toBe("CANCELLED");
    expect(mapCalTriggerToMeetingStatus("BOOKING_RESCHEDULED")).toBe("RESCHEDULED");
    expect(mapCalTriggerToMeetingStatus("BOOKING_COMPLETED")).toBe("COMPLETED");
  });
  it("valida HMAC do webhook", () => {
    const secret = "test-secret";
    const body = "{\"triggerEvent\":\"BOOKING_CREATED\"}";
    const { createHmac } = require("crypto") as typeof import("crypto");
    const sig = createHmac("sha256", secret).update(body).digest("hex");
    expect(verifyCalSignature(body, `sha256=${sig}`, secret)).toBe(true);
    expect(verifyCalSignature(body, "sha256=00", secret)).toBe(false);
  });
});

describe("agenda", () => {
  it("rejeita horário fora da janela", () => {
    const windows = [{ dayOfWeek: 1, startMinute: 9 * 60, endMinute: 12 * 60, active: true }];
    expect(slotFitsAvailability(1, 8 * 60, 30, windows)).toBe(false);
    expect(slotFitsAvailability(1, 9 * 60, 30, windows)).toBe(true);
    expect(slotFitsAvailability(1, 11 * 60 + 45, 30, windows)).toBe(false);
  });
});
