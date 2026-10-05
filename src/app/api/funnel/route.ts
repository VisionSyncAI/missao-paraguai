import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { writeFunnelEvent } from "@/lib/funnel";
import { rateLimit } from "@/lib/rateLimit";

const schema = z.object({
  event: z.enum([
    "INTEREST_CTA_CLICKED",
    "INTEREST_STARTED",
    "QUESTION_COMPLETED",
    "INTEREST_SUBMITTED",
    "CAL_OPENED",
    "CAL_BOOKING_STARTED",
    "CAL_BOOKING_CONFIRMED",
    "INTEREST_COMPLETED",
    "MAP_VIEWED",
    "MAP_ROUTE_ANIMATED",
    "MAP_ORIGIN_CLICKED",
    "MAP_BORDER_CLICKED",
    "MAP_DESTINATION_CLICKED",
    "MAP_CTA_CLICKED",
    "MAP_ROUTE_CLICKED",
    "DIAGNOSIS_STARTED",
    "DIAGNOSIS_COMPLETED",
    "DECISION_BOX_SUBMITTED",
    "ECOMAP_LAYER_SELECTED",
    "WHATSAPP_CLICK",
    "FAQ_OPEN",
    "PRICING_VIEW",
    "DECISION_BOX_COMPLETE",
    "PAGE_VIEW",
  ]),
  cta: z.string().max(80).optional(),
  source: z.string().max(80).optional(),
  pathname: z.string().max(160).optional(),
  step: z.string().max(40).optional(),
  utm: z.record(z.string(), z.string()).optional(),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!(await rateLimit(`funnel:${ip}`, 40, 60 * 1000))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  await writeFunnelEvent({
    event: parsed.data.event,
    step: parsed.data.step || parsed.data.cta,
    source: parsed.data.source,
    pathname: parsed.data.pathname,
    metadata: { utm: parsed.data.utm },
  });
  return NextResponse.json({ ok: true });
}
