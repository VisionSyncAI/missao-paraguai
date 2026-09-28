import { calConfig } from "@/modules/scheduling/config";
import type { VerifiedBooking } from "@/modules/scheduling/types";

async function calFetch(path: string) {
  const { apiUrl, apiKey } = calConfig();
  if (!apiUrl || !apiKey) throw new Error("CAL_NOT_CONFIGURED");
  const res = await fetch(`${apiUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "cal-api-version": "2024-09-04",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`CAL_HTTP_${res.status}`);
  }
  return res.json();
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.length > 0) return value;
  }
  return "";
}

export async function verifyCalBooking(uid: string): Promise<VerifiedBooking> {
  const data = await calFetch(`/v2/bookings/${encodeURIComponent(uid)}`);
  const booking = data?.data ?? data?.booking ?? data;
  const start = firstString(booking.start, booking.startTime, booking.start_time);
  const end = firstString(booking.end, booking.endTime, booking.end_time);
  const organizer = booking.user || booking.organizer || {};
  const attendee = Array.isArray(booking.attendees) ? booking.attendees[0] : booking.attendee;
  if (!start) throw new Error("CAL_BOOKING_INVALID");
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date(startDate.getTime() + 30 * 60 * 1000);
  return {
    uid: firstString(booking.uid, booking.id, uid),
    start: startDate,
    end: endDate,
    meetingUrl: firstString(booking.meetingUrl, booking.location, booking.videoCallUrl),
    hostEmail: firstString(organizer.email, booking.hostEmail).toLowerCase(),
    hostName: firstString(organizer.name, organizer.username, "Consultor"),
    attendeeEmail: firstString(attendee?.email, booking.email).toLowerCase(),
    status: firstString(booking.status, "accepted"),
  };
}

export async function listCalSlots(from: Date, to: Date) {
  const { eventTypeId } = calConfig();
  if (!eventTypeId) return [];
  const query = new URLSearchParams({
    eventTypeId,
    start: from.toISOString(),
    end: to.toISOString(),
  });
  const data = await calFetch(`/v2/slots?${query.toString()}`);
  const slots = data?.data ?? data?.slots ?? data;
  const list: { start: string }[] = [];
  if (Array.isArray(slots)) {
    for (const slot of slots) {
      const start = firstString(slot.start, slot.time, slot.startTime);
      if (start) list.push({ start: new Date(start).toISOString() });
    }
  } else if (slots && typeof slots === "object") {
    for (const value of Object.values(slots)) {
      if (!Array.isArray(value)) continue;
      for (const slot of value) {
        const start = firstString((slot as { start?: string }).start, (slot as { time?: string }).time);
        if (start) list.push({ start: new Date(start).toISOString() });
      }
    }
  }
  return list;
}
