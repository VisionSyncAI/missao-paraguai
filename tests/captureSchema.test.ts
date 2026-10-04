import { describe, expect, it } from "vitest";
import { captureSchema } from "@/modules/leads/captureSchema";
import { SEEKING_OPTIONS } from "@/modules/leads/status";

const essentials = {
  fullName: "Karina Teste",
  email: "karina.teste@exemplo.com",
  whatsapp: "11988887777",
  companyName: "Indústria Teste",
  jobTitle: "CEO / Presidente",
  interests: [SEEKING_OPTIONS[0]],
  consent: true,
};

describe("captureSchema — short form", () => {
  it("accepts only the six essentials", () => {
    expect(captureSchema.safeParse(essentials).success).toBe(true);
  });

  it("treats empty optional choices as not informed", () => {
    const r = captureSchema.safeParse({ ...essentials, segment: "", companySize: "", relationship: "", intent: "" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.companySize).toBeUndefined();
  });

  it("still rejects an invalid optional choice", () => {
    expect(captureSchema.safeParse({ ...essentials, companySize: "muito grande" }).success).toBe(false);
  });
});
