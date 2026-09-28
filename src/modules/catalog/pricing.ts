export type QuoteLine = {
  code: string;
  label: string;
  amountCents: number;
  priceVersionId?: string;
  productId?: string;
  addonId?: string;
};

export type QuoteInput = {
  officialAmountCents: number | null;
  officialPriceVersionId: string | null;
  productId: string;
  productCode: string;
  productName: string;
  discountBps?: number;
  addons?: { id: string; code: string; name: string; amountCents: number; enabled: boolean }[];
};

export function quoteOrder(input: QuoteInput) {
  if (input.officialAmountCents == null || !input.officialPriceVersionId) {
    return { blocked: "BLOCKED_BY_BUSINESS_DECISION" as const, reason: "official_price_missing" };
  }
  const lines: QuoteLine[] = [
    {
      code: input.productCode,
      label: input.productName,
      amountCents: input.officialAmountCents,
      priceVersionId: input.officialPriceVersionId,
      productId: input.productId,
    },
  ];
  for (const addon of input.addons || []) {
    if (!addon.enabled) {
      return { blocked: "BLOCKED_BY_BUSINESS_DECISION" as const, reason: `addon_disabled:${addon.code}` };
    }
    lines.push({
      code: addon.code,
      label: addon.name,
      amountCents: addon.amountCents,
      addonId: addon.id,
    });
  }
  const subtotalCents = lines.reduce((sum, line) => sum + line.amountCents, 0);
  const discountBps = Math.max(0, Math.min(input.discountBps || 0, 2000));
  const discountCents = Math.floor((subtotalCents * discountBps) / 10_000);
  return {
    blocked: null,
    subtotalCents,
    discountCents,
    totalCents: subtotalCents - discountCents,
    lines,
  };
}

export function canPublishOfficialPrice(amountCents: number) {
  return Number.isInteger(amountCents) && amountCents > 0;
}
