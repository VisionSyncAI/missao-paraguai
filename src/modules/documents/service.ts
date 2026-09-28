import { mkdir, writeFile, readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { validateUpload } from "@/modules/documents/rules";

export { canReadDocument, validateUpload } from "@/modules/documents/rules";

function storeDir() {
  return path.join(process.cwd(), "data", "private-documents");
}

export async function saveDocument(input: {
  registrationId: string;
  participantId: string;
  typeCode: string;
  mimeType: string;
  name: string;
  bytes: Buffer;
  actorId?: string;
}) {
  const ext = validateUpload({ mimeType: input.mimeType, sizeBytes: input.bytes.length, name: input.name });
  const type = await prisma.documentType.findUnique({ where: { code: input.typeCode } });
  if (!type) throw new Error("DOCUMENT_TYPE");

  const row = await prisma.missionDocument.create({
    data: {
      registrationId: input.registrationId,
      participantId: input.participantId,
      typeId: type.id,
      status: "UPLOADED",
      mimeType: input.mimeType,
      originalName: path.basename(input.name),
      sizeBytes: input.bytes.length,
    },
  });
  await mkdir(storeDir(), { recursive: true });
  const storageKey = `${row.id}${ext}`;
  await writeFile(path.join(storeDir(), storageKey), input.bytes);
  const updated = await prisma.missionDocument.update({
    where: { id: row.id },
    data: { storageKey, status: "UNDER_REVIEW" },
  });
  await writeAudit({
    actorId: input.actorId,
    action: "DOCUMENT_UPLOADED",
    resource: "MissionDocument",
    resourceId: row.id,
  });
  return updated;
}

export async function readDocumentFile(id: string) {
  const doc = await prisma.missionDocument.findUnique({ where: { id } });
  if (!doc?.storageKey) throw new Error("NOT_FOUND");
  const bytes = await readFile(path.join(storeDir(), doc.storageKey));
  return { doc, bytes };
}

export async function reviewDocument(id: string, status: "APPROVED" | "REJECTED", notes?: string, actorId?: string) {
  const updated = await prisma.missionDocument.update({
    where: { id },
    data: { status, reviewNotes: notes },
  });
  await writeAudit({ actorId, action: "DOCUMENT_REVIEWED", resource: "MissionDocument", resourceId: id, metadata: { status } });
  return updated;
}
