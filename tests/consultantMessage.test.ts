import { describe, expect, it } from "vitest";
import { consultantCallMessage } from "@/modules/interest/flow";

describe("consultantCallMessage", () => {
  it("greets the client by first name", () => {
    expect(consultantCallMessage("  Karina   Ricioni ")).toBe(
      "Olá, Karina. Recebemos seu interesse no PROVISION — Imersão Sem Fronteiras. O próximo passo é uma conversa com um consultor. O envio do formulário não confirma vaga.",
    );
  });

  it("falls back to a plain greeting without a name", () => {
    expect(consultantCallMessage("")).toBe("Olá. Recebemos seu interesse no PROVISION — Imersão Sem Fronteiras. O próximo passo é uma conversa com um consultor. O envio do formulário não confirma vaga.");
  });
});
