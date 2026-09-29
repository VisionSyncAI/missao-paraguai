import { NextRequest, NextResponse } from "next/server";
import { attachMeetingSchema } from "@/modules/leads/captureSchema";
import { attachMeetingToLead } from "@/modules/leads/service";
import { getLeadSessionId } from "@/lib/leadSession";
import { rateLimit } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!(await rateLimit(`leadmeet:${ip}`, 12, 10 * 60 * 1000))) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde alguns minutos." }, { status: 429 });
  }
  const parsed = attachMeetingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Validação falhou" }, { status: 400 });
  const leadId = await getLeadSessionId();
  try {
    const meeting = await attachMeetingToLead({
      ...parsed.data,
      token: parsed.data.token || undefined,
      leadId: leadId || undefined,
    });
    return NextResponse.json({
      ok: true,
      success: true,
      leadId: meeting.leadId,
      meetingId: meeting.meetingId,
      meeting,
      email: { status: meeting.emailStatus },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "LEAD_NOT_FOUND") return NextResponse.json({ error: "Pré-inscrição não encontrada." }, { status: 404 });
    if (message === "SLOT_TAKEN" || message === "SLOT_INVALID" || message === "SLOT_OUTSIDE_AVAILABILITY") {
      return NextResponse.json({ error: "Horário indisponível. Escolha outro." }, { status: 409 });
    }
    if (message === "CAL_BOOKING_REQUIRED" || message === "SCHEDULER_UNAVAILABLE") {
      return NextResponse.json({ error: "Confirme um horário com o consultor." }, { status: 409 });
    }
    if (message === "CONSULTANT_UNMAPPED") {
      return NextResponse.json({ error: "Consultor da agenda não está mapeado no CRM." }, { status: 409 });
    }
    logError("lead_meeting_failed", { code: message });
    return NextResponse.json({ error: "Não foi possível confirmar a reunião." }, { status: 500 });
  }
}
