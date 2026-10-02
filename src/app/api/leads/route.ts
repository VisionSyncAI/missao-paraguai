import { NextRequest, NextResponse } from "next/server";
import { captureSchema } from "@/modules/leads/captureSchema";
import { captureInterest } from "@/modules/leads/service";
import { setLeadSession } from "@/lib/leadSession";
import { rateLimit } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!(await rateLimit(`lead:${ip}`, 8, 10 * 60 * 1000))) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde alguns minutos." }, { status: 429 });
  }
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = captureSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validação falhou", issues: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const result = await captureInterest(parsed.data, {
      ip,
      userAgent: request.headers.get("user-agent"),
    });
    // Only a lead created by this request gets a session; an existing e-mail must be confirmed by its owner.
    if (result.created && result.leadId) await setLeadSession(result.leadId);
    return NextResponse.json({
      ok: true,
      token: result.accessToken,
      created: result.created,
      tokenPreserved: result.tokenPreserved,
      verificationRequired: result.verificationRequired,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    logError("lead_capture_failed", { code: message });
    return NextResponse.json({ error: "Não conseguimos salvar seus dados agora. Verifique sua conexão e tente novamente." }, { status: 500 });
  }
}
