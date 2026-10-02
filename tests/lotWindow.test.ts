import { describe, expect, it } from "vitest";
import { commercialWindow, sealLabel } from "../src/modules/commercial/lotWindow";

function phase(today: string, id: string) {
  return commercialWindow(today).lots.find((lot) => lot.id === id)?.phase;
}

describe("janela comercial por data", () => {
  it("em 1 de outubro o lote 01 está esgotando e os seguintes são a próxima condição", () => {
    const window = commercialWindow("2026-10-01");
    expect(window.closed).toBe(false);
    expect(window.currentId).toBe("l1");
    expect(phase("2026-10-01", "l1")).toBe("burning");
    expect(sealLabel("burning")).toBe("⚡ Esgotando");
    expect(phase("2026-10-01", "l2")).toBe("next");
    expect(phase("2026-10-01", "l3")).toBe("next");
    expect(phase("2026-10-01", "vip")).toBe("vip");
    expect(window.nextPrice).toBe("R$ 22.997");
  });

  it("no dia 7 de outubro o lote 01 encerra hoje", () => {
    expect(phase("2026-10-07", "l1")).toBe("today");
  });

  it("em 8 de outubro o lote 01 encerra e o lote 02 passa a valer", () => {
    expect(phase("2026-10-08", "l1")).toBe("closed");
    expect(phase("2026-10-08", "l2")).toBe("burning");
    expect(commercialWindow("2026-10-08").nextPrice).toBe("R$ 25.997");
  });

  it("em 14 de outubro só o lote 03 está vigente", () => {
    expect(phase("2026-10-14", "l1")).toBe("closed");
    expect(phase("2026-10-14", "l2")).toBe("closed");
    expect(phase("2026-10-14", "l3")).toBe("burning");
    expect(phase("2026-10-14", "vip")).toBe("vip");
  });

  it("a partir de 22 de outubro resta a experiência VIP", () => {
    expect(phase("2026-10-22", "l3")).toBe("closed");
    expect(phase("2026-10-22", "vip")).toBe("last");
    expect(phase("2026-10-26", "vip")).toBe("today");
  });

  it("em 27 de outubro as inscrições encerram sem abrir outro lote", () => {
    const window = commercialWindow("2026-10-27");
    expect(window.closed).toBe(true);
    expect(window.currentId).toBeNull();
    expect(window.lots.every((lot) => lot.phase === "closed")).toBe(true);
  });
});
