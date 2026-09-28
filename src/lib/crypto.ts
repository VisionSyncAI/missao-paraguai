import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function hashSecret(value: string) {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(value, salt, 32).toString("hex");
  return `${salt}:${key}`;
}

export function verifySecret(value: string, stored: string) {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const actual = scryptSync(value, salt, 32);
  const expected = Buffer.from(key, "hex");
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export function newAccessToken() {
  return randomBytes(32).toString("hex");
}

export function maskCpf(last4: string | null | undefined) {
  if (!last4) return "—";
  return `***.***.***-${last4}`;
}

export function hashIp(ip: string | null) {
  if (!ip) return null;
  return sha256(ip);
}
