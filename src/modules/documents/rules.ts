const ALLOWED = new Map([
  ["application/pdf", ".pdf"],
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
]);
export const MAX_DOCUMENT_BYTES = 8 * 1024 * 1024;

export function canReadDocument(input: {
  sessionParticipantId: string;
  sessionRegistrationId: string;
  documentParticipantId: string | null;
  documentRegistrationId: string;
}) {
  return (
    input.documentRegistrationId === input.sessionRegistrationId &&
    (!input.documentParticipantId || input.documentParticipantId === input.sessionParticipantId)
  );
}

export function validateUpload(input: { mimeType: string; sizeBytes: number; name: string }) {
  const ext = ALLOWED.get(input.mimeType);
  if (!ext) throw new Error("INVALID_MIME");
  if (input.sizeBytes <= 0 || input.sizeBytes > MAX_DOCUMENT_BYTES) throw new Error("INVALID_SIZE");
  const lower = input.name.toLowerCase();
  if (!lower.endsWith(ext) && !lower.endsWith(".jpeg")) throw new Error("INVALID_EXTENSION");
  return ext;
}
