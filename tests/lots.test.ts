import { describe, expect, it } from "vitest";
import { executivePhase, vipPhase } from "../src/js/lots.js";

describe("urgência por data de lote", () => {
  it("em 1º de outubro o lote 01 está esgotando e os seguintes ainda não abriram", () => {
    expect(executivePhase("2026-10-01", "2026-01-01", "2026-10-07")).toBe("ending");
    expect(executivePhase("2026-10-01", "2026-10-08", "2026-10-13")).toBe("upcoming");
    expect(executivePhase("2026-10-01", "2026-10-14", "2026-10-21")).toBe("upcoming");
    expect(vipPhase("2026-10-01")).toBe("vip");
  });

  it("no dia 07 o lote 01 encerra e no dia 08 o lote 02 assume", () => {
    expect(executivePhase("2026-10-07", "2026-01-01", "2026-10-07")).toBe("lastDay");
    expect(executivePhase("2026-10-08", "2026-01-01", "2026-10-07")).toBe("closed");
    expect(executivePhase("2026-10-08", "2026-10-08", "2026-10-13")).toBe("ending");
  });

  it("no dia 14 o lote 03 assume e no dia 22 só o VIP segue", () => {
    expect(executivePhase("2026-10-14", "2026-10-08", "2026-10-13")).toBe("closed");
    expect(executivePhase("2026-10-14", "2026-10-14", "2026-10-21")).toBe("ending");
    expect(executivePhase("2026-10-22", "2026-10-14", "2026-10-21")).toBe("closed");
    expect(vipPhase("2026-10-22")).toBe("vipLastDays");
    expect(vipPhase("2026-10-26")).toBe("vipLastDay");
    expect(vipPhase("2026-10-27")).toBe("closed");
  });
});
