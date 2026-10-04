import { describe, expect, it } from "vitest";
import { consultantCallMessage } from "@/modules/interest/flow";

describe("consultantCallMessage", () => {
  it("greets the client by first name", () => {
    expect(consultantCallMessage("  Karina   Ricioni ")).toBe(
      "Olá, Karina! Um de nossos consultores entrará em contato com você para conversar sobre a PROVISION.",
    );
  });

  it("falls back to a plain greeting without a name", () => {
    expect(consultantCallMessage("")).toBe("Olá! Um de nossos consultores entrará em contato com você para conversar sobre a PROVISION.");
  });
});
