import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { canPublishOfficialPrice, quoteOrder } from "@/modules/catalog/pricing";

export async function listCatalog() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { prices: { orderBy: { createdAt: "desc" } } },
  });
  return products.map((product) => {
    const official = product.prices.find((p) => p.official && !p.effectiveTo);
    return {
      code: product.code,
      name: product.name,
      kind: product.kind,
      officialAmountCents: official?.amountCents ?? null,
      officialPriceVersionId: official?.id ?? null,
      decisionStatus: official ? "OFFICIAL" : "PENDING_BUSINESS_DECISION",
      candidates: product.prices
        .filter((p) => !p.official)
        .map((p) => ({
          id: p.id,
          amountCents: p.amountCents,
          decisionStatus: p.decisionStatus,
        })),
    };
  });
}

export async function publishOfficialPrice(input: {
  productCode: string;
  amountCents: number;
  actorId?: string;
  actorRole?: string;
}) {
  if (!canPublishOfficialPrice(input.amountCents)) throw new Error("INVALID_PRICE");
  const product = await prisma.product.findUnique({ where: { code: input.productCode } });
  if (!product) throw new Error("PRODUCT_NOT_FOUND");
  const now = new Date();
  await prisma.priceVersion.updateMany({
    where: { productId: product.id, official: true, effectiveTo: null },
    data: { official: false, effectiveTo: now },
  });
  const version = await prisma.priceVersion.create({
    data: {
      productId: product.id,
      amountCents: input.amountCents,
      official: true,
      decisionStatus: "OFFICIAL",
      effectiveFrom: now,
    },
  });
  await writeAudit({
    actorId: input.actorId,
    actorRole: input.actorRole,
    action: "PRICE_PUBLISHED",
    resource: "PriceVersion",
    resourceId: version.id,
    metadata: { productCode: input.productCode },
  });
  return version;
}

export async function quoteProduct(productCode: string, addonCodes: string[], discountBps = 0) {
  const product = await prisma.product.findUnique({
    where: { code: productCode },
    include: { prices: true, addons: true },
  });
  if (!product || !product.active) throw new Error("PRODUCT_NOT_FOUND");
  const official = product.prices.find((p) => p.official && !p.effectiveTo);
  const addons = [];
  for (const code of addonCodes) {
    const addon = await prisma.addon.findUnique({ where: { code } });
    if (!addon) throw new Error("ADDON_NOT_FOUND");
    addons.push(addon);
  }
  return quoteOrder({
    officialAmountCents: official?.amountCents ?? null,
    officialPriceVersionId: official?.id ?? null,
    productId: product.id,
    productCode: product.code,
    productName: product.name,
    discountBps,
    addons,
  });
}
