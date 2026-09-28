import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { quoteProduct } from "@/modules/catalog/service";
import { writeAudit } from "@/lib/audit";
import { paymentConfigured, paymentProviderName, productionPaymentBlocked } from "@/modules/billing/provider";
import { sandboxProvider } from "@/modules/billing/sandbox";
import { assignPaidParticipant } from "@/modules/cohorts/assign";
import { emailUnique, enqueueEmail } from "@/modules/comms/email";
import { EmailCopy } from "@/modules/comms/templates";
import { newAccessToken, sha256 } from "@/lib/crypto";

export async function createOrder(input: {
  registrationId: string;
  productCode: string;
  addonCodes?: string[];
  proposalId?: string;
  actorId?: string;
}) {
  const registration = await prisma.registration.findUnique({
    where: { id: input.registrationId },
    include: { lead: true, orders: true },
  });
  if (!registration) throw new Error("REGISTRATION_NOT_FOUND");
  if (registration.lead.status !== "WON") throw new Error("LEAD_NOT_WON");

  let discountBps = 0;
  if (input.proposalId) {
    const proposal = await prisma.proposal.findUnique({ where: { id: input.proposalId } });
    if (!proposal || proposal.leadId !== registration.leadId) throw new Error("PROPOSAL_MISMATCH");
    if (proposal.status !== "ACCEPTED") throw new Error("PROPOSAL_NOT_ACCEPTED");
    discountBps = proposal.discountBps;
  }

  const quote = await quoteProduct(input.productCode, input.addonCodes || [], discountBps);
  if ("blocked" in quote && quote.blocked) throw new Error(quote.blocked);
  if (!("totalCents" in quote)) throw new Error("BLOCKED_BY_BUSINESS_DECISION");

  const order = await prisma.order.create({
    data: {
      leadId: registration.leadId,
      registrationId: registration.id,
      proposalId: input.proposalId,
      status: "PENDING_PAYMENT",
      currency: "BRL",
      subtotalCents: quote.subtotalCents,
      discountCents: quote.discountCents,
      totalCents: quote.totalCents,
      priceSnapshot: JSON.stringify(quote),
      items: {
        create: quote.lines.map((line) => ({
          productId: line.productId,
          addonId: line.addonId,
          label: line.label,
          amountCents: line.amountCents,
          priceVersionId: line.priceVersionId,
        })),
      },
    },
    include: { items: true },
  });
  await writeAudit({
    actorId: input.actorId,
    action: "ORDER_CREATED",
    resource: "Order",
    resourceId: order.id,
    metadata: { totalCents: order.totalCents },
  });
  return order;
}

export async function startPayment(orderId: string) {
  if (productionPaymentBlocked() || !paymentConfigured()) {
    throw new Error("BLOCKED_BY_BUSINESS_DECISION");
  }
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("ORDER_NOT_FOUND");
  if (order.status === "PAID") throw new Error("ORDER_ALREADY_PAID");

  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: paymentProviderName(),
      status: "PENDING",
      amountCents: order.totalCents,
      currency: order.currency,
    },
  });

  const created = await sandboxProvider.createPayment({
    orderId: order.id,
    paymentId: payment.id,
    amountCents: order.totalCents,
    currency: order.currency,
  });

  return prisma.payment.update({
    where: { id: payment.id },
    data: {
      providerRef: created.providerRef,
      checkoutUrl: created.checkoutUrl,
    },
  });
}

export async function applyPaymentWebhook(raw: string, signature: string | null) {
  if (!sandboxProvider.verifyWebhook(raw, signature)) throw new Error("INVALID_SIGNATURE");
  const body = JSON.parse(raw) as { eventId: string; type: string; paymentId: string; status: string };
  const uniqueKey = `${body.eventId}`;
  const rawHash = createHash("sha256").update(raw).digest("hex");

  const existing = await prisma.paymentWebhookEvent.findUnique({ where: { uniqueKey } });
  if (existing?.applied) return { ok: true, idempotent: true };

  await prisma.paymentWebhookEvent.upsert({
    where: { uniqueKey },
    update: { rawHash },
    create: {
      uniqueKey,
      provider: "sandbox",
      eventType: body.type,
      paymentId: body.paymentId,
      rawHash,
    },
  });

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: body.paymentId },
      include: { order: { include: { registration: { include: { lead: true, participant: true } } } } },
    });
    if (!payment) throw new Error("PAYMENT_NOT_FOUND");

    const mapped =
      body.status === "paid"
        ? "PAID"
        : body.status === "failed"
          ? "FAILED"
          : body.status === "canceled"
            ? "CANCELED"
            : body.status === "refunded"
              ? "REFUNDED"
              : "PENDING";

    await tx.payment.update({ where: { id: payment.id }, data: { status: mapped } });

    if (mapped === "PAID") {
      await tx.order.update({ where: { id: payment.orderId }, data: { status: "PAID" } });
      await tx.registration.update({
        where: { id: payment.order.registrationId },
        data: { status: "CONFIRMED" },
      });
    }
    if (mapped === "FAILED") {
      await tx.order.update({ where: { id: payment.orderId }, data: { status: "PENDING_PAYMENT" } });
    }
    if (mapped === "REFUNDED") {
      await tx.order.update({ where: { id: payment.orderId }, data: { status: "REFUNDED" } });
    }
    return { payment, mapped };
  });

  if (result.mapped === "PAID") {
    const assignment = await assignPaidParticipant(result.payment.order.registrationId);
    const lead = result.payment.order.registration.lead;
    let token = "";
    const participant = await prisma.participant.findUnique({
      where: { registrationId: result.payment.order.registrationId },
    });
    if (participant) {
      token = newAccessToken();
      await prisma.participant.update({
        where: { id: participant.id },
        data: { accessTokenHash: sha256(token), status: assignment.status },
      });
    }
    const copy = EmailCopy.paymentApproved(lead.fullName, token);
    await enqueueEmail({
      leadId: lead.id,
      eventType: "PAYMENT_APPROVED",
      uniqueKey: emailUnique("PAYMENT_APPROVED", result.payment.id),
      to: lead.email,
      subject: copy.subject,
      body: copy.body,
    });
    await enqueueEmail({
      leadId: lead.id,
      eventType: "DOCUMENT_PENDING",
      uniqueKey: emailUnique("DOCUMENT_PENDING", result.payment.order.registrationId),
      to: lead.email,
      subject: EmailCopy.documentPending(lead.fullName, token).subject,
      body: EmailCopy.documentPending(lead.fullName, token).body,
    });
  }

  if (result.mapped === "FAILED") {
    const lead = result.payment.order.registration.lead;
    const copy = EmailCopy.paymentFailed(lead.fullName);
    await enqueueEmail({
      leadId: lead.id,
      eventType: "PAYMENT_FAILED",
      uniqueKey: emailUnique("PAYMENT_FAILED", result.payment.id),
      to: lead.email,
      subject: copy.subject,
      body: copy.body,
    });
  }

  await prisma.paymentWebhookEvent.update({ where: { uniqueKey }, data: { applied: true } });
  await writeAudit({
    action: "PAYMENT_WEBHOOK",
    resource: "Payment",
    resourceId: result.payment.id,
    metadata: { status: result.mapped },
  });
  return { ok: true, status: result.mapped };
}
