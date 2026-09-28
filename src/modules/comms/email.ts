import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { logError, logInfo } from "@/lib/logger";

export type EmailInput = {
  leadId?: string | null;
  eventType: string;
  uniqueKey: string;
  to: string;
  subject: string;
  body: string;
};

export async function enqueueEmail(input: EmailInput) {
  const existing = await prisma.messageOutbox.findUnique({ where: { uniqueKey: input.uniqueKey } });
  if (existing?.status === "SENT" || existing?.status === "DEV_LOGGED") return existing;

  const row = existing
    ? existing
    : await prisma.messageOutbox.create({
        data: {
          leadId: input.leadId || null,
          eventType: input.eventType,
          channel: "email",
          toAddress: input.to,
          subject: input.subject,
          body: input.body,
          uniqueKey: input.uniqueKey,
          status: "PENDING",
        },
      });

  if (row.status === "SENT" || row.status === "DEV_LOGGED") return row;

  const key = process.env.RESEND_API_KEY;
  if (key) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || "Imersão Paraguai <noreply@imersaoparaguai.com>",
          to: [input.to],
          subject: input.subject,
          text: input.body,
        }),
      });
      if (!res.ok) throw new Error(`resend ${res.status}`);
      const sent = await prisma.messageOutbox.update({
        where: { id: row.id },
        data: { status: "SENT", sentAt: new Date(), error: null },
      });
      logInfo("email_sent", { eventType: input.eventType });
      return sent;
    } catch (error) {
      logError("email_failed", { eventType: input.eventType });
      return prisma.messageOutbox.update({
        where: { id: row.id },
        data: { status: "FAILED", error: error instanceof Error ? error.message : "send_failed" },
      });
    }
  }

  if (process.env.NODE_ENV === "production") {
    logError("email_blocked_no_provider", { eventType: input.eventType });
    return prisma.messageOutbox.update({
      where: { id: row.id },
      data: { status: "PENDING", error: "RESEND_API_KEY ausente — integração bloqueada pela configuração externa" },
    });
  }

  const dir = path.join(process.cwd(), "data", "outbox");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${row.id}.txt`), `${input.subject}\n\n${input.body}`, "utf8");
  const logged = await prisma.messageOutbox.update({
    where: { id: row.id },
    data: { status: "DEV_LOGGED", sentAt: new Date() },
  });
  logInfo("email_dev_logged", { eventType: input.eventType });
  return logged;
}

export function emailUnique(eventType: string, resourceId: string) {
  return `${eventType}:${resourceId}:email`;
}
