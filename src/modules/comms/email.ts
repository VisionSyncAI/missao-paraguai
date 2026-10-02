import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { Prisma } from "@prisma/client";
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

/**
 * Transactional outbox. Requests only persist the message; delivery happens in processOutbox(),
 * driven by the background worker (src/instrumentation.ts) and a non-blocking kick after enqueue.
 *
 * Statuses: PENDING (waiting or retry scheduled) → SENDING (claimed) → SENT | DEV_LOGGED,
 * or FAILED once MAX_ATTEMPTS is reached or the provider rejects the message permanently.
 */
export const MAX_ATTEMPTS = 8;
const BASE_BACKOFF_MS = 30_000;
const MAX_BACKOFF_MS = 60 * 60 * 1000;
const CLAIM_LOCK_MS = 2 * 60 * 1000;
const SEND_TIMEOUT_MS = 10_000;

export async function enqueueEmail(input: EmailInput) {
  let row;
  try {
    row = await prisma.messageOutbox.create({
      data: {
        leadId: input.leadId || null,
        eventType: input.eventType,
        channel: "email",
        toAddress: input.to,
        subject: input.subject,
        body: input.body,
        uniqueKey: input.uniqueKey,
        status: "PENDING",
        nextAttemptAt: new Date(),
        error: providerConfigured() || process.env.NODE_ENV !== "production"
          ? null
          : "RESEND_API_KEY ausente — aguardando configuração do provedor",
      },
    });
  } catch (error) {
    // Same uniqueKey already queued (retry or concurrent request): the outbox row is the dedupe point.
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) throw error;
    row = await prisma.messageOutbox.findUniqueOrThrow({ where: { uniqueKey: input.uniqueKey } });
  }
  kickOutbox();
  return row;
}

export function emailUnique(eventType: string, resourceId: string) {
  return `${eventType}:${resourceId}:email`;
}

export function emailDeliveryStatus(status: string): "sent" | "queued" | "failed" {
  if (status === "SENT") return "sent";
  if (status === "FAILED") return "failed";
  return "queued";
}

function providerConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export function backoffMs(attempt: number, random = Math.random) {
  const base = Math.min(BASE_BACKOFF_MS * 2 ** Math.max(0, attempt - 1), MAX_BACKOFF_MS);
  return Math.round(base * (0.9 + random() * 0.2));
}

function claimableWhere(now: Date): Prisma.MessageOutboxWhereInput {
  return {
    OR: [
      { status: "PENDING", OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }] },
      // Rows marked FAILED before this worker existed (never attempted by it) still get their retries;
      // a FAILED written by the worker always has lastAttemptAt and is final.
      { status: "FAILED", lastAttemptAt: null },
      // A worker that died mid-send leaves SENDING behind; take it over once the lock expires.
      { status: "SENDING", lockedUntil: { lt: now } },
    ],
  };
}

let inFlight: Promise<{ processed: number; skipped?: string }> | null = null;

/** Delivers due messages. Safe to call concurrently and from several processes. */
export async function processOutbox(options: { limit?: number; now?: Date; ids?: string[] } = {}) {
  if (inFlight) return inFlight;
  inFlight = runBatch(options).finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function runBatch({ limit = 20, now = new Date(), ids }: { limit?: number; now?: Date; ids?: string[] }) {
  if (!providerConfigured() && process.env.NODE_ENV === "production") {
    // Do not burn attempts while the provider is missing; everything stays PENDING until configured.
    return { processed: 0, skipped: "NO_PROVIDER" };
  }
  const due = await prisma.messageOutbox.findMany({
    where: ids ? { id: { in: ids }, ...claimableWhere(now) } : claimableWhere(now),
    orderBy: { createdAt: "asc" },
    take: limit,
    select: { id: true },
  });
  let processed = 0;
  for (const { id } of due) {
    if (!(await claimMessage(id, now))) continue; // another worker took it
    const row = await prisma.messageOutbox.findUniqueOrThrow({ where: { id } });
    await deliver(row);
    processed += 1;
  }
  return { processed };
}

/** Atomic claim: exactly one worker wins a due message. */
export async function claimMessage(id: string, now = new Date()) {
  const claimed = await prisma.messageOutbox.updateMany({
    where: { id, ...claimableWhere(now) },
    data: {
      status: "SENDING",
      lockedUntil: new Date(now.getTime() + CLAIM_LOCK_MS),
      attempts: { increment: 1 },
      lastAttemptAt: now,
    },
  });
  return claimed.count === 1;
}

type OutboxRow = Awaited<ReturnType<typeof prisma.messageOutbox.findUniqueOrThrow>>;

async function deliver(row: OutboxRow) {
  if (!providerConfigured()) {
    // Development: keep a readable copy instead of sending.
    const dir = path.join(process.cwd(), "data", "outbox");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${row.id}.txt`), `${row.subject}\n\n${row.body}`, "utf8");
    await prisma.messageOutbox.update({
      where: { id: row.id },
      data: { status: "DEV_LOGGED", sentAt: new Date(), lockedUntil: null, error: null },
    });
    logInfo("email_dev_logged", { eventType: row.eventType });
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        // Resend drops a repeated request with the same key, so a crash after sending cannot double-send.
        "Idempotency-Key": row.uniqueKey.slice(0, 256),
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "Imersão Paraguai <noreply@imersaoparaguai.com>",
        to: [row.toAddress],
        subject: row.subject,
        text: row.body,
      }),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });
    if (res.ok) {
      await prisma.messageOutbox.update({
        where: { id: row.id },
        data: { status: "SENT", sentAt: new Date(), lockedUntil: null, error: null, nextAttemptAt: null },
      });
      logInfo("email_sent", { eventType: row.eventType, attempts: row.attempts });
      return;
    }
    const detail = (await res.text().catch(() => "")).slice(0, 300);
    // 429 and 5xx are transient; other 4xx (bad sender, invalid address, auth) will not fix themselves.
    const retryable = res.status === 429 || res.status >= 500;
    await recordFailure(row, `resend ${res.status}: ${detail}`, retryable);
  } catch (error) {
    // Network error or timeout: transient.
    await recordFailure(row, error instanceof Error ? error.message : "send_failed", true);
  }
}

async function recordFailure(row: OutboxRow, message: string, retryable: boolean) {
  const permanent = !retryable || row.attempts >= MAX_ATTEMPTS;
  await prisma.messageOutbox.update({
    where: { id: row.id },
    data: permanent
      ? { status: "FAILED", error: message, lockedUntil: null, nextAttemptAt: null }
      : {
          status: "PENDING",
          error: message,
          lockedUntil: null,
          nextAttemptAt: new Date(Date.now() + backoffMs(row.attempts)),
        },
  });
  logError(permanent ? "email_failed_permanent" : "email_retry_scheduled", {
    eventType: row.eventType,
    attempts: row.attempts,
  });
}

/** Fire-and-forget delivery right after enqueue; the periodic worker covers anything this misses. */
function kickOutbox() {
  if (process.env.VITEST) return;
  setImmediate(() => {
    processOutbox({ limit: 5 }).catch((error) => {
      logError("outbox_kick_failed", { code: error instanceof Error ? error.message : "UNKNOWN" });
    });
  });
}
