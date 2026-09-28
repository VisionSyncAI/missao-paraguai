import { NextRequest, NextResponse } from "next/server";
import { getParticipantSession } from "@/lib/participantAuth";
import { canReadDocument, readDocumentFile } from "@/modules/documents/service";

export async function GET(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getParticipantSession();
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const { id } = await ctx.params;
  const { doc, bytes } = await readDocumentFile(id);
  if (
    !canReadDocument({
      sessionParticipantId: session.id,
      sessionRegistrationId: session.registrationId,
      documentParticipantId: doc.participantId,
      documentRegistrationId: doc.registrationId,
    })
  ) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": doc.mimeType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${doc.originalName || "documento"}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
