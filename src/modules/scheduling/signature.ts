import { createHmac, timingSafeEqual } from "crypto";

export function verifyCalSignature(rawBody: string, header: string | null, secret: string) {
  if (!header || !secret) return false;
  const provided = header.replace(/^sha256=/i, "").trim();
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(provided, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
