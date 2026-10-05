import { timingSafeEqual } from "crypto";

/** Unguessable path. The public site does not link to it. Consultants copy it from the staff board. */
export const PROPOSAL_SHARE_TOKEN = "724dee0cae5c370b5da936d16b7ecc05a961a4f36c61d078";

export const PROPOSAL_FILE = "private/proposta-imersao-paraguai-2026.pdf";

export function proposalTokenMatches(value: string) {
  const expected = Buffer.from(PROPOSAL_SHARE_TOKEN);
  const given = Buffer.from(value);
  if (given.length !== expected.length) return false;
  return timingSafeEqual(expected, given);
}
