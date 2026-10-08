import { timingSafeEqual } from "crypto";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { NextResponse } from "next/server";

/** Unguessable path. The public site does not link to it. Consultants copy it from the staff board. */
export const PROPOSAL_SHARE_TOKEN = "724dee0cae5c370b5da936d16b7ecc05a961a4f36c61d078";

export const PROPOSAL_FILE = "private/proposta-imersao-paraguai-2026.pdf";

export function proposalTokenMatches(value: string) {
  const expected = Buffer.from(PROPOSAL_SHARE_TOKEN);
  const given = Buffer.from(value);
  if (given.length !== expected.length) return false;
  return timingSafeEqual(expected, given);
}

/** The proposal PDF, with no login and no form. */
export async function proposalPdfResponse() {
  const filePath = path.join(process.cwd(), PROPOSAL_FILE);
  const fileStat = await stat(filePath);
  const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
  return new NextResponse(stream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(fileStat.size),
      "Content-Disposition": 'attachment; filename="PROVISION-Imersao-Paraguai-2026.pdf"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
