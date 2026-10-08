import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolvePublicLead } from "@/lib/leadAccess";
import { proposalPdfResponse } from "@/lib/proposalLink";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const lead = token ? await resolvePublicLead(token) : null;
  if (lead) {
    const presentation = await prisma.presentation.findFirst({ where: { active: true } });
    if (presentation) {
      await prisma.presentationDownload.create({
        data: { leadId: lead.id, presentationId: presentation.id },
      });
      await prisma.activity.create({
        data: { leadId: lead.id, type: "PRESENTATION_DOWNLOADED", body: "Apresentação executiva baixada." },
      });
      if (lead.status === "FORM_SUBMITTED") {
        await prisma.lead.update({
          where: { id: lead.id },
          data: { status: "PRESENTATION_AVAILABLE" },
        });
      }
    }
  }
  return proposalPdfResponse();
}
