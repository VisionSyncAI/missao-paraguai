import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { mapCalTriggerToMeetingStatus } from "@/modules/scheduling/types";
import { formatSaoPaulo } from "@/lib/timezone";
import { logInfo } from "@/lib/logger";
import { emailUnique, enqueueEmail } from "@/modules/comms/email";
import { EmailCopy } from "@/modules/comms/templates";
import { writeAudit } from "@/lib/audit";
import { officialMeetingUrl } from "@/lib/meetingLink";

type CalPayload = {
  triggerEvent?: string;
  trigger?: string;
  payload?: Record<string, unknown>;
};

function pick(obj: Record<string, unknown> | undefined, keys: string[]) {
  if (!obj) return "";
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value) return value;
  }
  return "";
}

export async function applyCalWebhook(body: CalPayload, raw: string) {
  const trigger = String(body.triggerEvent || body.trigger || "");
  const payload = (body.payload || body) as Record<string, unknown>;
  const uid = pick(payload, ["uid", "bookingUid", "id"]);
  if (!uid) throw new Error("CAL_WEBHOOK_UID");
  const uniqueKey = `${trigger}:${uid}`;
  const rawHash = createHash("sha256").update(raw).digest("hex");

  try {
    await prisma.calWebhookEvent.create({
      data: { uniqueKey, trigger, bookingUid: uid, rawHash, applied: false },
    });
  } catch {
    return { ok: true, idempotent: true, uid, trigger };
  }

  const status = mapCalTriggerToMeetingStatus(trigger);
  if (!status) {
    await prisma.calWebhookEvent.update({ where: { uniqueKey }, data: { applied: true } });
    return { ignored: true, trigger };
  }

  const startRaw = pick(payload, ["startTime", "start", "start_time"]);
  const meetingUrl = pick(payload, ["meetingUrl", "location", "videoCallUrl"]);
  const organizer = (payload.organizer || payload.user || {}) as Record<string, unknown>;
  const hostEmail = pick(organizer, ["email"]).toLowerCase();

  const existing = await prisma.meeting.findUnique({
    where: { providerBookingUid: uid },
    include: { lead: true },
  });
  if (!existing) {
    logInfo("cal_webhook_unbound", { trigger, hasUid: true });
    return { unbound: true, uid, trigger };
  }

  const data: { status: string; scheduledAt?: Date; meetingUrl?: string } = { status };
  if (startRaw) data.scheduledAt = new Date(startRaw);
  const officialUrl = officialMeetingUrl(meetingUrl);
  if (officialUrl) data.meetingUrl = officialUrl;
  await prisma.meeting.update({ where: { id: existing.id }, data });

  const activityType =
    status === "CANCELLED"
      ? "MEETING_CANCELLED"
      : status === "RESCHEDULED"
        ? "MEETING_RESCHEDULED"
        : status === "COMPLETED" || status === "NO_SHOW"
          ? "MEETING_COMPLETED"
          : "MEETING_SCHEDULED";

  await prisma.activity.create({
    data: {
      leadId: existing.leadId,
      type: activityType,
      body: `Agenda atualizada pelo motor de scheduling (${status}${startRaw ? ` · ${formatSaoPaulo(new Date(startRaw))}` : ""}).`,
    },
  });

  if (status === "COMPLETED") {
    await prisma.lead.update({
      where: { id: existing.leadId },
      data: { status: "MEETING_COMPLETED" },
    });
  }

  if (hostEmail) {
    const consultant = await prisma.consultant.findFirst({ where: { email: hostEmail, status: "ACTIVE" } });
    if (consultant && consultant.id !== existing.consultantId) {
      await prisma.meeting.update({ where: { id: existing.id }, data: { consultantId: consultant.id } });
      await prisma.lead.update({ where: { id: existing.leadId }, data: { consultantId: consultant.id } });
    }
  }

  const copy = EmailCopy.meetingUpdated(
    existing.lead.fullName,
    status,
    startRaw ? new Date(startRaw) : existing.scheduledAt,
    officialMeetingUrl(meetingUrl) || officialMeetingUrl(existing.meetingUrl) || "",
  );
  await enqueueEmail({
    leadId: existing.leadId,
    eventType: activityType,
    uniqueKey: emailUnique(activityType, `${existing.id}:${status}:${startRaw || ""}`),
    to: existing.lead.email,
    subject: copy.subject,
    body: copy.body,
  });

  await prisma.calWebhookEvent.update({ where: { uniqueKey }, data: { applied: true } });
  await writeAudit({
    action: "CAL_WEBHOOK",
    resource: "Meeting",
    resourceId: existing.id,
    metadata: { status, trigger },
  });
  logInfo("cal_webhook_applied", { trigger, meetingId: existing.id, status });
  return { ok: true, meetingId: existing.id, status };
}
