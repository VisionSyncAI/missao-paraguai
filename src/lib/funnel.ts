import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

function newId() {
  return `c${randomBytes(12).toString("hex")}`;
}

export async function writeFunnelEvent(input: {
  event: string;
  step?: string;
  source?: string;
  pathname?: string;
  metadata?: Record<string, unknown>;
}) {
  const client = prisma as unknown as {
    funnelEvent?: { create: (args: { data: Record<string, unknown> }) => Promise<unknown> };
  };
  const data = {
    event: input.event,
    step: input.step || null,
    source: input.source || null,
    pathname: input.pathname || null,
    metadata: JSON.stringify(input.metadata || {}),
  };
  if (client.funnelEvent) {
    await client.funnelEvent.create({ data });
    return;
  }
  await prisma.$executeRaw`
    INSERT INTO FunnelEvent (id, event, step, source, pathname, metadata)
    VALUES (${newId()}, ${data.event}, ${data.step}, ${data.source}, ${data.pathname}, ${data.metadata})
  `;
}
