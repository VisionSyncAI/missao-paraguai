import { readFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolvePublicLead } from "@/lib/leadAccess";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const lead = await resolvePublicLead(token);
  if (!lead) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const presentation = await prisma.presentation.findFirst({ where: { active: true } });
  if (!presentation) return NextResponse.json({ error: "Apresentação indisponível" }, { status: 404 });

  await prisma.presentationDownload.create({
    data: { leadId: lead.id, presentationId: presentation.id },
  });
  await prisma.activity.create({
    data: { leadId: lead.id, type: "PRESENTATION_DOWNLOADED", body: "Apresentação executiva baixada." },
  });
  if (lead.status === "FORM_SUBMITTED" || lead.status === "MEETING_SCHEDULED") {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: lead.status === "FORM_SUBMITTED" ? "PRESENTATION_AVAILABLE" : lead.status },
    });
  }

  const filePath = path.isAbsolute(presentation.filePath)
    ? presentation.filePath
    : path.join(process.cwd(), presentation.filePath);
  const file = await readFile(filePath);
  return new NextResponse(file, {
    headers: {
      "Content-Type": presentation.mimeType,
      "Content-Length": String(file.byteLength),
      "Content-Disposition": `attachment; filename="apresentacao-imersao-paraguai.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
