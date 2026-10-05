import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { PROVISION, lotBalance } from "../src/data/provision.config";

const root = path.join(__dirname, "..");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

const publicSurfaces = ["public/site.html", "src/app/termos/page.tsx", "src/app/layout.tsx"];

describe("regra comercial única", () => {
  const agenda = JSON.parse(read("content/agenda-oficial.json"));

  it("bate com a agenda oficial em capacidade, preços e pré-reserva", () => {
    expect(PROVISION.companies).toBe(agenda.capacity.companies);
    expect(PROVISION.representativesPerCompany).toBe(agenda.capacity.representativesPerCompany);
    expect(PROVISION.representativesPerCompany).toBe(3);
    expect(agenda.capacity.ticket).toMatch(/por participante/);
    expect(PROVISION.preReservation).toBe(agenda.commercial.preReservation);
    for (const lot of agenda.commercial.lots) {
      const config = PROVISION.lots.find((item) => item.code === lot.code);
      expect(config?.total).toBe(lot.total);
      expect(lotBalance(lot.total)).toBe(lot.balance);
    }
  });

  it("não promete três pessoas no mesmo ingresso nem cota de quatro encontros", () => {
    for (const file of publicSurfaces) {
      const text = read(file);
      expect(text).not.toMatch(/até quatro encontros|quatro encontros/);
      expect(text).not.toMatch(/3 representantes incluíd|três pessoas incluíd/i);
    }
  });

  it("o site mostra a unidade da vaga, a passagem e os quatro saldos", () => {
    const site = read("public/site.html");
    expect(site).toContain("até 3 executivos por empresa");
    expect(site).toContain("O investimento é por participante.");
    expect(site).not.toMatch(/próprio ingresso/);
    expect(site).not.toContain("1 representante por empresa");
    expect(site).toContain("Passagem aérea não incluída");
    expect(site).toContain("apartamento individual");
    expect(site).toContain("R$ 16.497");
    expect(site).toContain("R$ 19.497");
    expect(site).toContain("R$ 22.497");
    expect(site).toContain("R$ 26.497");
    expect(site).toContain("das 14:00 às 15:30");
    expect(site).toContain("Condições de pagamento apresentadas pelo consultor durante a confirmação da participação.");
    expect(site).not.toMatch(/vencimento indicado|prazo do saldo|saldo vence/);
    expect(site).toContain("sem cota de reuniões");
    expect(site).toContain("reunião de acompanhamento com o consultor");
    expect(site).toContain("o consultor pode fazer essa reunião em conjunto");
    expect(site).not.toContain("Cerca de 50 pessoas");
  });

  it("o lote visível no JavaScript usa os mesmos totais da configuração", () => {
    const lots = read("public/legacy/js/lots.js");
    expect(lots).toBe(read("src/js/lots.js"));
    for (const lot of PROVISION.lots) {
      if (lot.code === "VIP") continue;
      expect(lots).toContain(`R$ ${lot.total.toLocaleString("pt-BR")}`);
    }
    expect(lots).toContain("2026-10-26");
  });
});
