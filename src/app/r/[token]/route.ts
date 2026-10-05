import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { NextResponse } from "next/server";
import { PROPOSAL_FILE, proposalTokenMatches } from "@/lib/proposalLink";

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  if (!proposalTokenMatches(token)) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), PROPOSAL_FILE);
  const fileStat = await stat(filePath);
  const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
  return new NextResponse(stream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(fileStat.size),
      "Content-Disposition": 'inline; filename="PROVISION-Imersao-Paraguai-2026.pdf"',
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "Referrer-Policy": "no-referrer",
    },
  });
}
