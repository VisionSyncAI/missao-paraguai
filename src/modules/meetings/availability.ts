import { prisma } from "@/lib/prisma";
import {
  addDaysYmd,
  fromSaoPauloLocal,
  weekdayInSaoPaulo,
  ymdInSaoPaulo,
} from "@/lib/timezone";

const HORIZON_DAYS = 14;
const BOOKABLE = ["SCHEDULED", "CONFIRMED"];

export { BOOKABLE };

export type Slot = {
  start: string;
  consultantId: string;
  consultantName: string;
};

export async function listAvailableSlots(from = new Date()): Promise<Slot[]> {
  const consultants = await prisma.consultant.findMany({
    where: { status: "ACTIVE" },
    include: { slots: { where: { active: true } } },
  });
  const meetings = await prisma.meeting.findMany({
    where: {
      status: { in: BOOKABLE },
      scheduledAt: { gte: from },
    },
    select: { consultantId: true, scheduledAt: true },
  });
  const taken = new Set(meetings.map((m) => `${m.consultantId}:${m.scheduledAt.toISOString()}`));
  const startYmd = ymdInSaoPaulo(from);
  const slots: Slot[] = [];

  for (let d = 0; d < HORIZON_DAYS; d += 1) {
    const day = addDaysYmd(startYmd.year, startYmd.month, startYmd.day, d);
    const weekday = weekdayInSaoPaulo(day.year, day.month, day.day);
    for (const consultant of consultants) {
      const windows = consultant.slots.filter((s) => s.dayOfWeek === weekday);
      for (const window of windows) {
        for (let minute = window.startMinute; minute + window.slotMinutes <= window.endMinute; minute += window.slotMinutes) {
          const start = fromSaoPauloLocal(day.year, day.month, day.day, minute);
          if (start.getTime() <= from.getTime() + 15 * 60 * 1000) continue;
          const key = `${consultant.id}:${start.toISOString()}`;
          if (taken.has(key)) continue;
          slots.push({
            start: start.toISOString(),
            consultantId: consultant.id,
            consultantName: consultant.name,
          });
        }
      }
    }
  }
  return slots.sort((a, b) => a.start.localeCompare(b.start));
}
