import { beforeAll, describe, expect, it } from "vitest";
import { readLeadVerifyToken, signLeadVerifyToken } from "../src/lib/leadVerify";
import { leadSessionSecret, sessionTimes, signSession, verifySession } from "../src/lib/signedSession";

beforeAll(() => {
  process.env.LEAD_SESSION_SECRET = process.env.LEAD_SESSION_SECRET || "test-lead-secret";
});

describe("lead verify token", () => {
  it("round-trips the lead id", async () => {
    const token = await signLeadVerifyToken("lead_abc");
    expect(await readLeadVerifyToken(token)).toBe("lead_abc");
  });

  it("is not accepted as a lead session cookie, and a session cookie is not a verify token", async () => {
    const verify = await signLeadVerifyToken("lead_abc");
    expect(await verifySession(verify, leadSessionSecret(), "lead")).toBeNull();
    const session = await signSession({ kind: "lead", sub: "lead_abc", ...sessionTimes(60) }, leadSessionSecret());
    expect(await readLeadVerifyToken(session)).toBeNull();
  });

  it("rejects tampered, expired and missing tokens", async () => {
    const token = await signLeadVerifyToken("lead_abc");
    expect(await readLeadVerifyToken(`${token.slice(0, -2)}00`)).toBeNull();
    const expired = await signSession({ kind: "lead_verify", sub: "lead_abc", iat: 1, exp: 2 }, leadSessionSecret());
    expect(await readLeadVerifyToken(expired)).toBeNull();
    expect(await readLeadVerifyToken(null)).toBeNull();
    expect(await readLeadVerifyToken("")).toBeNull();
  });
});
