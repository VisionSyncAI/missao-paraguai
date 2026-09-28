import { prisma } from "@/lib/prisma";
import { canTransitionLead } from "@/modules/leads/status";
import { writeAudit } from "@/lib/audit";
import { quoteProduct } from "@/modules/catalog/service";

export const PROPOSAL_STATUSES = ["DRAFT", "SENT", "VIEWED", "NEGOTIATING", "ACCEPTED", "REJECTED", "EXPIRED"] as const;

export async function createProposal(input: {
  leadId: string;
  productCode: string;
  addonCodes?: string[];
  notes?: string;
  validUntil?: string;
  discountBps?: number;
  ownerId?: string;
}) {
  const lead = await prisma.lead.findUnique({ where: { id: input.leadId } });
  if (!lead) throw new Error("LEAD_NOT_FOUND");
  const product = await prisma.product.findUnique({ where: { code: input.productCode } });
  if (!product) throw new Error("PRODUCT_NOT_FOUND");
  const quote = await quoteProduct(input.productCode, input.addonCodes || [], input.discountBps || 0);
  if ("blocked" in quote && quote.blocked) throw new Error(quote.blocked);
  if (!("lines" in quote)) throw new Error("BLOCKED_BY_BUSINESS_DECISION");

  const proposal = await prisma.proposal.create({
    data: {
      leadId: lead.id,
      companyId: lead.companyId,
      ownerId: input.ownerId || lead.consultantId,
      status: "DRAFT",
      notes: input.notes,
      discountBps: input.discountBps || 0,
      validUntil: input.validUntil ? new Date(input.validUntil) : null,
      items: {
        create: quote.lines.map((line) => ({
          productId: line.productId || product.id,
          priceVersionId: line.priceVersionId,
          amountCents: line.amountCents,
          label: line.label,
        })),
      },
      versions: {
        create: { version: 1, snapshot: JSON.stringify(quote) },
      },
    },
    include: { items: true, versions: true },
  });

  if (canTransitionLead(lead.status, "PROPOSAL")) {
    await prisma.lead.update({ where: { id: lead.id }, data: { status: "PROPOSAL" } });
    await prisma.activity.create({
      data: { leadId: lead.id, type: "PROPOSAL_CREATED", body: `Proposta ${proposal.id} criada.`, actorId: input.ownerId },
    });
  }
  await writeAudit({
    actorId: input.ownerId,
    action: "PROPOSAL_CREATED",
    resource: "Proposal",
    resourceId: proposal.id,
  });
  return proposal;
}

export async function transitionProposal(id: string, status: (typeof PROPOSAL_STATUSES)[number], actorId?: string) {
  const proposal = await prisma.proposal.findUnique({ where: { id }, include: { lead: true } });
  if (!proposal) throw new Error("NOT_FOUND");
  const updated = await prisma.proposal.update({ where: { id }, data: { status } });
  await prisma.activity.create({
    data: { leadId: proposal.leadId, type: "PROPOSAL_STATUS", body: `${proposal.status} → ${status}`, actorId },
  });
  if (status === "NEGOTIATING" && canTransitionLead(proposal.lead.status, "NEGOTIATION")) {
    await prisma.lead.update({ where: { id: proposal.leadId }, data: { status: "NEGOTIATION" } });
  }
  if (status === "ACCEPTED" && canTransitionLead(proposal.lead.status, "WON")) {
    await prisma.lead.update({ where: { id: proposal.leadId }, data: { status: "WON" } });
    await prisma.activity.create({
      data: { leadId: proposal.leadId, type: "STATUS_CHANGED", body: `${proposal.lead.status} → WON`, actorId },
    });
  }
  await writeAudit({ actorId, action: "PROPOSAL_STATUS", resource: "Proposal", resourceId: id, metadata: { status } });
  return updated;
}
