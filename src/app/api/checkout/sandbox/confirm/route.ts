import { NextRequest, NextResponse } from "next/server";
import { applyPaymentWebhook } from "@/modules/billing/service";
import { signSandboxWebhook } from "@/modules/billing/sandbox";

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "SANDBOX_FORBIDDEN_IN_PRODUCTION" }, { status: 503 });
  }
  const raw = await request.text();
  try {
    const result = await applyPaymentWebhook(raw, signSandboxWebhook(raw));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "UNKNOWN" }, { status: 400 });
  }
}
