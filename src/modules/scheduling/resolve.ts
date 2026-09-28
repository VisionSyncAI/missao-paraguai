import { prisma } from "@/lib/prisma";
import { allowLocalScheduler, calConfig } from "@/modules/scheduling/config";
import { verifyCalBooking } from "@/modules/scheduling/calClient";
import type { VerifiedBooking } from "@/modules/scheduling/types";
import { listAvailableSlots } from "@/modules/meetings/availability";
import { slotFitsAvailability } from "@/modules/meetings/rules";
import { minuteOfDayInSaoPaulo, weekdayInSaoPaulo, ymdInSaoPaulo } from "@/lib/timezone";

export async function resolveVerifiedBooking(input: {
  calBookingUid?: string;
  scheduledAt?: string;
  consultantId?: string;
}): Promise<{ booking: VerifiedBooking; consultantId: string; provider: "cal" | "local" }> {
  if (calConfig().configured) {
    if (!input.calBookingUid) throw new Error("CAL_BOOKING_REQUIRED");
    const booking = await verifyCalBooking(input.calBookingUid);
    if (booking.start.getTime() <= Date.now() - 60_000) throw new Error("SLOT_INVALID");
    const consultant = await prisma.consultant.findFirst({
      where: { status: "ACTIVE", email: booking.hostEmail },
    });
    if (!consultant) throw new Error("CONSULTANT_UNMAPPED");
    const taken = await prisma.meeting.findFirst({
      where: { providerBookingUid: booking.uid },
    });
    if (taken) throw new Error("SLOT_TAKEN");
    return { booking, consultantId: consultant.id, provider: "cal" };
  }

  if (!allowLocalScheduler()) throw new Error("SCHEDULER_UNAVAILABLE");
  if (!input.scheduledAt || !input.consultantId) throw new Error("SLOT_INVALID");
  const start = new Date(input.scheduledAt);
  if (Number.isNaN(start.getTime()) || start.getTime() <= Date.now()) throw new Error("SLOT_INVALID");
  const consultant = await prisma.consultant.findFirst({
    where: { id: input.consultantId, status: "ACTIVE" },
    include: { slots: true },
  });
  if (!consultant) throw new Error("CONSULTANT_INACTIVE");
  const ymd = ymdInSaoPaulo(start);
  const weekday = weekdayInSaoPaulo(ymd.year, ymd.month, ymd.day);
  const minute = minuteOfDayInSaoPaulo(start);
  if (!slotFitsAvailability(weekday, minute, 30, consultant.slots)) throw new Error("SLOT_OUTSIDE_AVAILABILITY");
  const open = await listAvailableSlots();
  if (!open.some((s) => s.start === start.toISOString() && s.consultantId === consultant.id)) {
    throw new Error("SLOT_TAKEN");
  }
  return {
    provider: "local",
    consultantId: consultant.id,
    booking: {
      uid: `local:${consultant.id}:${start.toISOString()}`,
      start,
      end: new Date(start.getTime() + 30 * 60 * 1000),
      meetingUrl: "",
      hostEmail: consultant.email,
      hostName: consultant.name,
      attendeeEmail: "",
      status: "accepted",
    },
  };
}
