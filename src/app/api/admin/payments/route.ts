import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertPermission, getStaffSession } from "@/lib/auth";

export async function GET() {
  const session = await getStaffSession();
  try {
    assertPermission(session, "payment:read");
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: session ? 403 : 401 });
  }
  const payments = await prisma.payment.findMany({
    include: { order: { include: { registration: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    payments: payments.map((p) => ({
      id: p.id,
      status: p.status,
      amountCents: p.amountCents,
      provider: p.provider,
      checkoutUrl: p.checkoutUrl,
      name: p.order.registration.fullName,
      orderId: p.orderId,
    })),
  });
}
