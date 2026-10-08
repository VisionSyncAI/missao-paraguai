import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { PROPOSAL_SHARE_TOKEN, proposalTokenMatches } from "../src/lib/proposalLink";

const root = path.join(__dirname, "..");

describe("link oculto da proposta", () => {
  it("aceita só o token inteiro", () => {
    expect(proposalTokenMatches(PROPOSAL_SHARE_TOKEN)).toBe(true);
    expect(proposalTokenMatches(PROPOSAL_SHARE_TOKEN.slice(0, -1))).toBe(false);
    expect(proposalTokenMatches(`${PROPOSAL_SHARE_TOKEN}a`)).toBe(false);
    expect(proposalTokenMatches("")).toBe(false);
  });

  it("a home oferece o download sem publicar o endereço antigo", () => {
    const site = readFileSync(path.join(root, "public/site.html"), "utf8");
    expect(site).toContain('href="/apresentacao"');
    expect(site).not.toContain(PROPOSAL_SHARE_TOKEN);
    expect(site).not.toContain("/r/");
  });
});
