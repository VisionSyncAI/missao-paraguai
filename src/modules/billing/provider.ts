export type CreatePaymentInput = {
  orderId: string;
  paymentId: string;
  amountCents: number;
  currency: string;
};

export type CreatePaymentResult = {
  providerRef: string;
  checkoutUrl: string;
  status: "PENDING" | "BLOCKED";
};

export interface PaymentProvider {
  name: string;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  verifyWebhook(raw: string, signature: string | null): boolean;
}

export function paymentProviderName() {
  return (process.env.PAYMENT_PROVIDER || "").trim().toLowerCase();
}

export function paymentConfigured() {
  const name = paymentProviderName();
  if (name === "sandbox") return process.env.NODE_ENV !== "production";
  return false;
}

export function productionPaymentBlocked() {
  return process.env.NODE_ENV === "production" && paymentProviderName() !== "configured-later";
}
