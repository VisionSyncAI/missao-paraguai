import { describe, expect, it } from "vitest";
import { shapeSiteAnalytics } from "../src/lib/siteAnalytics";

describe("análise do site", () => {
  it("separa visitas, cliques e o avanço do formulário", () => {
    const view = shapeSiteAnalytics([
      { event: "PAGE_VIEW", step: "HOME", count: 12 },
      { event: "PAGE_VIEW", step: "INTERESSE", count: 4 },
      { event: "INTEREST_CTA_CLICKED", step: "QUERO_PARTICIPAR", count: 5 },
      { event: "INTEREST_CTA_CLICKED", step: "APRESENTACAO", count: 2 },
      { event: "WHATSAPP_CLICK", step: "FALAR_COM_CONSULTOR", count: 3 },
      { event: "QUESTION_COMPLETED", step: "name", count: 4 },
      { event: "QUESTION_COMPLETED", step: "company", count: 3 },
      { event: "INTEREST_STARTED", step: null, count: 4 },
      { event: "INTEREST_SUBMITTED", step: null, count: 1 },
    ]);

    expect(view.visits).toBe(16);
    expect(view.clicks.participar).toBe(5);
    expect(view.clicks.apresentacao).toBe(2);
    expect(view.clicks.whatsapp).toBe(3);
    expect(view.form.started).toBe(4);
    expect(view.form.steps.find((step) => step.id === "name")?.count).toBe(4);
    expect(view.form.steps.find((step) => step.id === "company")?.count).toBe(3);
    expect(view.form.steps.find((step) => step.id === "role")?.count).toBe(0);
    expect(view.form.submitted).toBe(1);
  });
});
