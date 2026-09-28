export type VerifiedBooking = {
  uid: string;
  start: Date;
  end: Date;
  meetingUrl: string;
  hostEmail: string;
  hostName: string;
  attendeeEmail: string;
  status: string;
};

export type PublicSlot = {
  start: string;
  consultantId: string;
  consultantName: string;
  source: "cal" | "local";
};

export function mapCalTriggerToMeetingStatus(trigger: string) {
  const event = trigger.toUpperCase();
  if (event.includes("CANCEL")) return "CANCELLED";
  if (event.includes("RESCHEDULE")) return "RESCHEDULED";
  if (event.includes("NO_SHOW") || event.includes("NOSHOW")) return "NO_SHOW";
  if (event.includes("COMPLETED") || event.includes("ENDED") || event.includes("MEETING_ENDED")) return "COMPLETED";
  if (event.includes("CREATED") || event.includes("CONFIRMED") || event.includes("REQUESTED")) return "SCHEDULED";
  return null;
}
