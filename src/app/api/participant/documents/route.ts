import { NextRequest, NextResponse } from "next/server";
import { getParticipantSession } from "@/lib/participantAuth";
import { saveDocument } from "@/modules/documents/service";

export async function POST(request: NextRequest) {
  const session = await getParticipantSession();
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  const typeCode = String(form.get("typeCode") || "");
  if (!(file instanceof File) || !typeCode) return NextResponse.json({ error: "INVALID_UPLOAD" }, { status: 400 });
  const bytes = Buffer.from(await file.arrayBuffer());
  try {
    const doc = await saveDocument({
      registrationId: session.registrationId,
      participantId: session.id,
      typeCode,
      mimeType: file.type,
      name: file.name,
      bytes,
      actorId: session.id,
    });
    return NextResponse.json({ ok: true, document: { id: doc.id, status: doc.status } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "UNKNOWN" }, { status: 400 });
  }
}
