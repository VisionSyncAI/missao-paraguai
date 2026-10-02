import { describe, expect, it } from "vitest";
import { lotCopy } from "../src/js/lots.js";
import { lotCopy as legacyLotCopy } from "../public/legacy/js/lots.js";

describe("texto comercial dos lotes (sem escassez simulada)", () => {
  it("em 02/10 o Lote 01 vigente encerra em 5 dias e a próxima virada é o Lote 02", () => {
    const copy = lotCopy("2026-10-02");
    expect(copy.current?.id).toBe("1");
    expect(copy.seals["1"]).toBe("Vigente · encerra em 5 dias");
    expect(copy.seals["2"]).toBe("A partir de 08/10");
    expect(copy.seals["3"]).toBe("A partir de 14/10");
    expect(copy.seals.vip).toBe("Experiência VIP");
    expect(copy.banner).toBe("Lote 01 vigente: esta condição encerra em 5 dias (07/10). Próxima virada: Lote 02 · R$ 22.997 a partir de 08/10.");
  });

  it("no último dia diz que encerra hoje", () => {
    expect(lotCopy("2026-10-07").seals["1"]).toBe("Vigente · encerra hoje");
    expect(lotCopy("2026-10-06").seals["1"]).toBe("Vigente · encerra amanhã");
  });

  it("depois do Lote 03 só o VIP segue, e após 26/10 encerra", () => {
    const lot3 = lotCopy("2026-10-15");
    expect(lot3.banner).toContain("segue apenas a experiência VIP, até 26/10");
    const vip = lotCopy("2026-10-24");
    expect(vip.current).toBeNull();
    expect(vip.seals.vip).toBe("VIP · encerra em 2 dias");
    expect(vip.banner).toContain("as inscrições desta edição se encerram");
    expect(lotCopy("2026-10-27").closed).toBe(true);
  });

  it("nunca fala em vagas, esgotando ou últimas vagas", () => {
    for (const day of ["2026-10-02", "2026-10-07", "2026-10-12", "2026-10-21", "2026-10-25", "2026-10-26"]) {
      const { seals, banner } = lotCopy(day);
      const text = [banner, ...Object.values(seals)].join(" ");
      expect(text).not.toMatch(/esgot|vaga|restam|últimas/i);
    }
  });

  it("a cópia publicada em public/legacy é idêntica", () => {
    expect(legacyLotCopy("2026-10-02")).toEqual(lotCopy("2026-10-02"));
  });
});
