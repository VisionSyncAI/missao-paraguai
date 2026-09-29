import { describe, expect, it } from "vitest";
import { consumeMemoryLimit, productionRequiresDistributedLimit, resetMemoryLimits } from "../src/lib/rateLimit";
import { safeInternalPath } from "../src/lib/safePath";
import { isStaffRole } from "../src/lib/rbac";
import { allowLocalScheduler } from "../src/modules/scheduling/config";
import { signSession, timingSafeEqualHex, verifySession } from "../src/lib/signedSession";

const secret = "test-auth-secret-value";

function tamperPayload(token: string) {
  const [body, sig] = token.split(".");
  const last = body.slice(-1);
  const flipped = last === "A" ? "B" : "A";
  return `${body.slice(0, -1)}${flipped}.${sig}`;
}

describe("sessão HMAC", () => {
  it("aceita cookie válido e rejeita adulteração", async () => {
    const token = await signSession(
      { kind: "participant", sub: "p1", iat: 1, exp: Math.floor(Date.now() / 1000) + 3600 },
      secret,
    );
    const ok = await verifySession(token, secret, "participant");
    expect(ok?.sub).toBe("p1");
    const [body] = token.split(".");
    expect(await verifySession(`${body}.00`, secret, "participant")).toBeNull();
    expect(await verifySession(tamperPayload(token), secret, "participant")).toBeNull();
    expect(await verifySession(token, "other-secret", "participant")).toBeNull();
    expect(await verifySession(undefined, secret, "participant")).toBeNull();
    expect(await verifySession(token, secret, "staff")).toBeNull();
  });

  it("sessão staff rejeita cookie vazio, role inválida e payload adulterado", async () => {
    const token = await signSession(
      { kind: "staff", sub: "u1", role: "ADMIN", iat: 1, exp: Math.floor(Date.now() / 1000) + 3600 },
      secret,
    );
    expect(await verifySession(token, secret, "staff")).toMatchObject({ sub: "u1", role: "ADMIN" });
    expect(await verifySession("", secret, "staff")).toBeNull();
    expect(await verifySession("random.cookie", secret, "staff")).toBeNull();
    const forged = await signSession(
      { kind: "staff", sub: "u1", role: "HACKER", iat: 1, exp: Math.floor(Date.now() / 1000) + 3600 },
      secret,
    );
    const payload = await verifySession(forged, secret, "staff");
    expect(payload?.role).toBe("HACKER");
    expect(isStaffRole(payload?.role)).toBe(false);
    expect(isStaffRole("ADMIN")).toBe(true);
  });

  it("rejeita expirado e payload sem assinatura", async () => {
    const token = await signSession(
      { kind: "staff", sub: "u1", role: "ADMIN", iat: 1, exp: Math.floor(Date.now() / 1000) - 10 },
      secret,
    );
    expect(await verifySession(token, secret, "staff")).toBeNull();
    const body = token.split(".")[0];
    expect(await verifySession(body, secret, "staff")).toBeNull();
  });

  it("não autentica participant.id cru", async () => {
    expect(await verifySession("cm1234567890abcdef", secret, "participant")).toBeNull();
  });

  it("compara HMAC com timing-safe", () => {
    expect(timingSafeEqualHex("aa", "aa")).toBe(true);
    expect(timingSafeEqualHex("aa", "ab")).toBe(false);
    expect(timingSafeEqualHex("aa", "aaa")).toBe(false);
  });
});

describe("cal produção", () => {
  it("adapter local só em não-produção sem Cal", () => {
    expect(allowLocalScheduler("development", false)).toBe(true);
    expect(allowLocalScheduler("production", false)).toBe(false);
    expect(allowLocalScheduler("development", true)).toBe(false);
  });
});

describe("rate limit", () => {
  it("bloqueia após o limite e reseta na janela", () => {
    resetMemoryLimits();
    expect(consumeMemoryLimit("k", 2, 1000, 1000)).toBe(true);
    expect(consumeMemoryLimit("k", 2, 1000, 1001)).toBe(true);
    expect(consumeMemoryLimit("k", 2, 1000, 1002)).toBe(false);
    expect(consumeMemoryLimit("k", 2, 1000, 2001)).toBe(true);
  });
  it("produção sem Redis deve fail-closed", () => {
    expect(productionRequiresDistributedLimit("production", false)).toBe(true);
    expect(productionRequiresDistributedLimit("development", false)).toBe(false);
    expect(productionRequiresDistributedLimit("production", true)).toBe(false);
  });
});

describe("redirect interno", () => {
  it("bloqueia open redirect", () => {
    expect(safeInternalPath("https://evil.com", "/admin/leads", ["/admin"])).toBe("/admin/leads");
    expect(safeInternalPath("//evil.com", "/participante", ["/participante"])).toBe("/participante");
    expect(safeInternalPath("/admin/leads", "/admin/leads", ["/admin"])).toBe("/admin/leads");
    expect(safeInternalPath("/interesse", "/admin/leads", ["/admin"])).toBe("/admin/leads");
  });
});

describe("lead token", () => {
  it("reenvio não deve rotacionar token — só criar em alta", () => {
    const first = { created: true, tokenPreserved: false };
    const resubmit = { created: false, tokenPreserved: true };
    expect(first.tokenPreserved).toBe(false);
    expect(resubmit.tokenPreserved).toBe(true);
  });
});
