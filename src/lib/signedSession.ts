export type SessionKind = "staff" | "participant" | "lead";

export type SignedSession = {
  kind: SessionKind;
  sub: string;
  iat: number;
  exp: number;
  role?: string;
  consultantId?: string | null;
  email?: string;
  name?: string;
};

function bytesToHex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function toBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export async function hmacSha256Hex(secret: string, data: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return bytesToHex(sig);
}

export function timingSafeEqualHex(a: string, b: string) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export async function signSession(payload: SignedSession, secret: string) {
  if (!secret) throw new Error("SESSION_SECRET_MISSING");
  const body = toBase64Url(JSON.stringify(payload));
  const sig = await hmacSha256Hex(secret, body);
  return `${body}.${sig}`;
}

export async function verifySession(token: string | undefined, secret: string, expectedKind?: SessionKind) {
  if (!token || !secret) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = await hmacSha256Hex(secret, body);
  if (!timingSafeEqualHex(sig, expected)) return null;
  try {
    const payload = JSON.parse(fromBase64Url(body)) as SignedSession;
    if (!payload.sub || !payload.kind || !payload.exp) return null;
    if (expectedKind && payload.kind !== expectedKind) return null;
    if (payload.exp * 1000 <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function staffSecret() {
  return process.env.AUTH_SECRET || "";
}

export function participantSecret() {
  return process.env.PARTICIPANT_AUTH_SECRET || process.env.AUTH_SECRET || "";
}

export function leadSessionSecret() {
  return process.env.LEAD_SESSION_SECRET || process.env.AUTH_SECRET || "";
}

export function sessionTimes(maxAgeSec: number) {
  const iat = Math.floor(Date.now() / 1000);
  return { iat, exp: iat + maxAgeSec };
}
