import { describe, expect, it } from "vitest";
import { executivePhase, vipPhase } from "../public/legacy/js/lots.js";

describe("urgência dos lotes por data", () => {
  it("em 1 de outubro o lote 01 está esgotando", () => {
    expect(executivePhase("2026-10-01", "2026-01-01", "2026-10-07")).toBe("burning");
    expect(executivePhase("2026-10-01", "2026-10-08", "2026-10-13")).toBe("upcoming");
    expect(executivePhase("2026-10-01", "2026-10-14", "2026-10-21")).toBe("upcoming");
    expect(vipPhase("2026-10-01")).toBe("vip");
  });

  it("marca o último dia e os dois dias anteriores", () => {
    expect(executivePhase("2026-10-05", "2026-01-01", "2026-10-07")).toBe("last");
    expect(executivePhase("2026-10-07", "2026-01-01", "2026-10-07")).toBe("today");
    expect(executivePhase("2026-10-13", "2026-10-08", "2026-10-13")).toBe("today");
    expect(executivePhase("2026-10-21", "2026-10-14", "2026-10-21")).toBe("today");
    expect(vipPhase("2026-10-26")).toBe("today");
  });

  it("vira a condição no dia seguinte ao encerramento", () => {
    expect(executivePhase("2026-10-08", "2026-01-01", "2026-10-07")).toBe("closed");
    expect(executivePhase("2026-10-08", "2026-10-08", "2026-10-13")).toBe("burning");
    expect(executivePhase("2026-10-14", "2026-10-14", "2026-10-21")).toBe("burning");
    expect(executivePhase("2026-10-22", "2026-10-14", "2026-10-21")).toBe("closed");
    expect(vipPhase("2026-10-22")).toBe("last");
    expect(vipPhase("2026-10-27")).toBe("closed");
  });
});
