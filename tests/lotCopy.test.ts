import { describe, expect, it } from "vitest";
import { lotCopy } from "../src/js/lots.js";
import { lotCopy as legacyLotCopy } from "../public/legacy/js/lots.js";

describe("texto comercial dos lotes (urgência por data, sem estoque)", () => {
  it("em 02/10 o Lote 01 está esgotando e os seguintes são a próxima condição", () => {
    const copy = lotCopy("2026-10-02");
    expect(copy.current?.id).toBe("1");
    expect(copy.seals["1"]).toBe("⚡ ESGOTANDO");
    expect(copy.seals["2"]).toBe("PRÓXIMA CONDIÇÃO");
    expect(copy.seals["3"]).toBe("PRÓXIMA CONDIÇÃO");
    expect(copy.seals.vip).toBe("EXPERIÊNCIA VIP");
    expect(copy.banner).toContain("próxima virada de condição");
    expect(copy.banner).toContain("R$ 22.997");
  });

  it("no último dia diz que encerra hoje e no dia anterior marca últimos dias", () => {
    expect(lotCopy("2026-10-07").seals["1"]).toBe("⚡ ENCERRA HOJE");
    expect(lotCopy("2026-10-06").seals["1"]).toBe("⚡ ÚLTIMOS DIAS");
  });

  it("vira o lote na data e encerra a edição depois do VIP", () => {
    expect(lotCopy("2026-10-08").seals["1"]).toBe("ENCERRADO");
    expect(lotCopy("2026-10-08").seals["2"]).toBe("⚡ ESGOTANDO");
    expect(lotCopy("2026-10-14").seals["3"]).toBe("⚡ ESGOTANDO");
    expect(lotCopy("2026-10-22").seals.vip).toBe("⚡ ÚLTIMOS DIAS");
    expect(lotCopy("2026-10-26").seals.vip).toBe("⚡ ENCERRA HOJE");
    expect(lotCopy("2026-10-27").closed).toBe(true);
  });

  it("nunca fala em vagas restantes, empresas restantes ou estoque", () => {
    for (const day of ["2026-10-02", "2026-10-07", "2026-10-12", "2026-10-21", "2026-10-25", "2026-10-26"]) {
      const { seals, banner } = lotCopy(day);
      const text = [banner, ...Object.values(seals)].join(" ");
      expect(text).not.toMatch(/restam|vagas restantes|empresas restantes|últimas \d|últimas vagas/i);
    }
  });

  it("a cópia publicada em public/legacy é idêntica", () => {
    expect(legacyLotCopy("2026-10-02")).toEqual(lotCopy("2026-10-02"));
    expect(legacyLotCopy("2026-10-26")).toEqual(lotCopy("2026-10-26"));
  });
});

describe("preço no hero acompanha o lote vigente", () => {
  it("mostra o menor preço aberto e a data de fim da condição", async () => {
    const { heroOffer } = await import("../src/js/lots.js");
    expect(heroOffer("2026-10-03")).toEqual({ price: "A partir de R$ 19.997", until: "Condição vigente até 07/10/2026." });
    expect(heroOffer("2026-10-08").price).toBe("A partir de R$ 22.997");
    expect(heroOffer("2026-10-15").until).toBe("Condição vigente até 21/10/2026.");
    expect(heroOffer("2026-10-24")).toEqual({ price: "Experiência VIP · R$ 29.997", until: "Condição vigente até 26/10/2026." });
    expect(heroOffer("2026-10-27").price).toBe("Inscrições encerradas");
  });
});
