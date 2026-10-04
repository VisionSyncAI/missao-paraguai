import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

/** content/agenda-oficial.json is the single source of truth: the public page must not drift from it. */
const root = path.join(__dirname, "..");
const agenda = JSON.parse(readFileSync(path.join(root, "content/agenda-oficial.json"), "utf8"));
const site = readFileSync(path.join(root, "public/site.html"), "utf8");

describe("agenda oficial", () => {
  it("publishes every institutional item", () => {
    for (const item of agenda.institutional.items) expect(site).toContain(item);
  });

  it("publishes every visit with its city and time", () => {
    for (const v of agenda.visits.items) {
      expect(site).toContain(v.name);
      expect(site).toContain(`${v.city} · ${v.time}`);
    }
  });

  it("keeps hotel, capacity and B2B window aligned", () => {
    expect(site).toContain(agenda.period.hotel);
    expect(site).toContain(`${agenda.capacity.companies} empresas`);
    expect(site).toContain(`das ${agenda.businessDay.b2b.replace("–", " às ")}`);
  });

  it("publishes the contract prices and pre-reservation", () => {
    const brl = (n: number) => "R$ " + n.toLocaleString("pt-BR");
    for (const lot of agenda.commercial.lots) expect(site).toContain(brl(lot.total));
    expect(site).toContain(brl(agenda.commercial.preReservation) + ",00");
    expect(site).not.toMatch(/validação jurídica|em validação/);
  });

  it("does not publish Paraguayan guest sectors while they are undocumented", () => {
    expect(agenda.businessDay.guestSectorsDocumented).toBe(false);
    expect(site).not.toContain("Perfil dos convidados");
  });
});
