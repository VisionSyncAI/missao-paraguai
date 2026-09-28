import { NextRequest, NextResponse } from "next/server";
import { applyPaymentWebhook } from "@/modules/billing/service";
import { logError } from "@/lib/logger";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`paywh:${ip}`, 60, 60 * 1000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const raw = await request.text();
  const signature = request.headers.get("x-payment-signature") || request.headers.get("x-webhook-signature");
  try {
    const result = await applyPaymentWebhook(raw, signature);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    logError("payment_webhook_failed", { code: message });
    const status = message === "INVALID_SIGNATURE" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
