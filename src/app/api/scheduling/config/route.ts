import { NextResponse } from "next/server";
import { allowLocalScheduler, calConfig } from "@/modules/scheduling/config";

export async function GET() {
  const cal = calConfig();
  return NextResponse.json({
    provider: cal.configured ? "cal" : allowLocalScheduler() ? "local" : "none",
    configured: cal.configured,
    embedOrigin: cal.embedOrigin || null,
    calLink: cal.calLink || null,
    eventTypeId: cal.eventTypeId || null,
  });
}
