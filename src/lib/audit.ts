import { prisma } from "@/lib/prisma";
import { logInfo } from "@/lib/logger";

export async function writeAudit(input: {
  actorId?: string | null;
  actorRole?: string | null;
  action: string;
  resource: string;
  resourceId: string;
  result?: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId || null,
      actorRole: input.actorRole || null,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId,
      result: input.result || "OK",
      metadata: JSON.stringify(input.metadata || {}),
    },
  });
  logInfo("audit", { action: input.action, resource: input.resource, resourceId: input.resourceId });
}
