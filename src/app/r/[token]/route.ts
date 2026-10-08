import { NextResponse } from "next/server";
import { proposalPdfResponse, proposalTokenMatches } from "@/lib/proposalLink";

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  if (!proposalTokenMatches(token)) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  return proposalPdfResponse();
}
