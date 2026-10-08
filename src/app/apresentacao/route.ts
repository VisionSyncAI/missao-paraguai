import { proposalPdfResponse } from "@/lib/proposalLink";

export async function GET() {
  return proposalPdfResponse();
}
