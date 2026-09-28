import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertPermission, getStaffSession } from "@/lib/auth";
import { createOrder, startPayment } from "@/modules/billing/service";

export async function GET() {
  const session = await getStaffSession();
  try {
    assertPermission(session, "order:read");
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: session ? 403 : 401 });
  }
  const orders = await prisma.order.findMany({
    include: { payments: true, registration: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    orders: orders.map((o) => ({
      id: o.id,
      status: o.status,
      totalCents: o.totalCents,
      currency: o.currency,
      registrationId: o.registrationId,
      name: o.registration.fullName,
      payments: o.payments.map((p) => ({ id: p.id, status: p.status, checkoutUrl: p.checkoutUrl })),
    })),
  });
}

const schema = z.object({
  registrationId: z.string(),
  productCode: z.string(),
  addonCodes: z.array(z.string()).optional(),
  proposalId: z.string().optional(),
  startCheckout: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getStaffSession();
  try {
    assertPermission(session, "order:write");
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: session ? 403 : 401 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Validação falhou" }, { status: 400 });
  try {
    const order = await createOrder({ ...parsed.data, actorId: session!.userId });
    let payment = null;
    if (parsed.data.startCheckout) {
      payment = await startPayment(order.id);
    }
    return NextResponse.json({ ok: true, order, payment });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    return NextResponse.json({ error: message }, { status: message === "BLOCKED_BY_BUSINESS_DECISION" ? 409 : 400 });
  }
}
