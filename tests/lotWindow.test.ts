import { describe, expect, it } from "vitest";
import { executivePhase, vipPhase } from "../src/js/lots.js";
import { emptyDraft, validateStep } from "../src/modules/interest/flow";

describe("janelas de lote", () => {
  it("em 1º de outubro o lote 01 está esgotando e os seguintes ainda não abriram", () => {
    expect(executivePhase("2026-10-01", "2026-01-01", "2026-10-07")).toBe("ending");
    expect(executivePhase("2026-10-01", "2026-10-08", "2026-10-13")).toBe("upcoming");
    expect(vipPhase("2026-10-01")).toBe("vip");
  });

  it("no dia do encerramento o selo é encerra hoje", () => {
    expect(executivePhase("2026-10-07", "2026-01-01", "2026-10-07")).toBe("lastDay");
    expect(executivePhase("2026-10-13", "2026-10-08", "2026-10-13")).toBe("lastDay");
    expect(executivePhase("2026-10-21", "2026-10-14", "2026-10-21")).toBe("lastDay");
    expect(vipPhase("2026-10-26")).toBe("vipLastDay");
  });

  it("vira o lote no dia seguinte e encerra a edição em 27 de outubro", () => {
    expect(executivePhase("2026-10-08", "2026-01-01", "2026-10-07")).toBe("closed");
    expect(executivePhase("2026-10-08", "2026-10-08", "2026-10-13")).toBe("ending");
    expect(executivePhase("2026-10-14", "2026-10-08", "2026-10-13")).toBe("closed");
    expect(executivePhase("2026-10-14", "2026-10-14", "2026-10-21")).toBe("ending");
    expect(vipPhase("2026-10-22")).toBe("vipLastDays");
    expect(vipPhase("2026-10-27")).toBe("closed");
  });
});

describe("delegação e acompanhante", () => {
  it("não aceita grupo acima de 5 nem segue sem a resposta de acompanhante", () => {
    expect(validateStep("delegation", { ...emptyDraft(), oversizedGroup: true })).toMatch(/até 5/);
    expect(validateStep("delegation", { ...emptyDraft(), delegationSize: 3 })).toBeNull();
    expect(validateStep("companion", emptyDraft())).toBeTruthy();
    expect(validateStep("companion", { ...emptyDraft(), companionRequested: false })).toBeNull();
  });
});
