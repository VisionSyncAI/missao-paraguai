import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertPermission, getStaffSession } from "@/lib/auth";
import { readDocumentFile, reviewDocument } from "@/modules/documents/service";

export async function GET() {
  const session = await getStaffSession();
  try {
    assertPermission(session, "document:read");
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: session ? 403 : 401 });
  }
  const documents = await prisma.missionDocument.findMany({
    include: { type: true, registration: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    documents: documents.map((d) => ({
      id: d.id,
      status: d.status,
      type: d.type.name,
      name: d.registration.fullName,
      originalName: d.originalName,
    })),
  });
}

const schema = z.object({
  id: z.string(),
  status: z.enum(["APPROVED", "REJECTED"]),
  notes: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  const session = await getStaffSession();
  try {
    assertPermission(session, "document:write");
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: session ? 403 : 401 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Validação falhou" }, { status: 400 });
  const updated = await reviewDocument(parsed.data.id, parsed.data.status, parsed.data.notes, session!.userId);
  return NextResponse.json({ ok: true, document: updated });
}

export async function PUT(request: NextRequest) {
  const session = await getStaffSession();
  try {
    assertPermission(session, "document:read");
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: session ? 403 : 401 });
  }
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id" }, { status: 400 });
  const { doc, bytes } = await readDocumentFile(id);
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": doc.mimeType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${doc.originalName || "documento"}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
