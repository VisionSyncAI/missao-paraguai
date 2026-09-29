import { NextResponse } from "next/server";
import { allowLocalScheduler, calConfig } from "@/modules/scheduling/config";
import { listAvailableSlots } from "@/modules/meetings/availability";
import { listCalSlots } from "@/modules/scheduling/calClient";
import { prisma } from "@/lib/prisma";
import { bookingEnd } from "@/modules/meetings/window";

export async function GET() {
  const cal = calConfig();
  if (cal.configured) {
    const from = new Date();
    const to = bookingEnd();
    try {
      const calSlots = await listCalSlots(from, to);
      const consultants = await prisma.consultant.findMany({ where: { status: "ACTIVE" } });
      const fallback = consultants[0];
      const slots = calSlots.map((slot) => ({
        start: slot.start,
        consultantId: fallback?.id || "cal",
        consultantName: fallback?.name || "Consultor",
        source: "cal" as const,
      }));
      return NextResponse.json({ provider: "cal", slots, grouped: {} });
    } catch {
      return NextResponse.json({ error: "Agenda indisponível", provider: "cal", slots: [] }, { status: 503 });
    }
  }
  if (!allowLocalScheduler()) {
    return NextResponse.json({ error: "Motor de agenda não configurado", provider: "none", slots: [] }, { status: 503 });
  }
  const slots = (await listAvailableSlots()).map((slot) => ({ ...slot, source: "local" as const }));
  return NextResponse.json({ provider: "local", slots });
}
