import { NextRequest, NextResponse } from "next/server";
import { interestSchema } from "@/modules/leads/schema";
import { submitInterest } from "@/modules/leads/service";
import { rateLimit } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`lead:${ip}`, 8, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde alguns minutos." }, { status: 429 });
  }
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = interestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validação falhou", issues: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const result = await submitInterest(parsed.data, {
      ip,
      userAgent: request.headers.get("user-agent"),
      source: parsed.data.source,
    });
    return NextResponse.json({ ok: true, token: result.accessToken });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "SLOT_TAKEN" || message === "SLOT_INVALID" || message === "SLOT_OUTSIDE_AVAILABILITY") {
      return NextResponse.json({ error: "Horário indisponível. Escolha outro." }, { status: 409 });
    }
    if (message === "CAL_BOOKING_REQUIRED" || message === "SCHEDULER_UNAVAILABLE") {
      return NextResponse.json({ error: "Confirme um horário com o consultor antes de enviar." }, { status: 409 });
    }
    if (message === "CONSULTANT_UNMAPPED") {
      return NextResponse.json({ error: "Consultor da agenda não está mapeado no CRM." }, { status: 409 });
    }
    logError("lead_submit_failed", { code: message });
    return NextResponse.json({ error: "Não foi possível registrar o interesse." }, { status: 500 });
  }
}
