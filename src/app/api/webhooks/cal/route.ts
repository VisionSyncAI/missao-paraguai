import { NextRequest, NextResponse } from "next/server";
import { calConfig } from "@/modules/scheduling/config";
import { verifyCalSignature } from "@/modules/scheduling/signature";
import { applyCalWebhook } from "@/modules/scheduling/webhook";
import { logError } from "@/lib/logger";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`calwh:${ip}`, 60, 60 * 1000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const raw = await request.text();
  const { webhookSecret } = calConfig();
  if (!webhookSecret) {
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 503 });
  }
  const signature =
    request.headers.get("x-cal-signature-256") ||
    request.headers.get("x-cal-signature") ||
    request.headers.get("x-webhook-signature");
  if (!verifyCalSignature(raw, signature, webhookSecret)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }
  try {
    const body = JSON.parse(raw);
    const result = await applyCalWebhook(body, raw);
    return NextResponse.json(result);
  } catch (error) {
    logError("cal_webhook_failed", { code: error instanceof Error ? error.message : "UNKNOWN" });
    return NextResponse.json({ error: "webhook_failed" }, { status: 400 });
  }
}
