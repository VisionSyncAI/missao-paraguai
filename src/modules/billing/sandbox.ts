import { createHmac, timingSafeEqual } from "crypto";
import type { PaymentProvider } from "@/modules/billing/provider";

function appUrl() {
  return process.env.APP_URL || "http://localhost:3000";
}

export function sandboxSecret() {
  return process.env.PAYMENT_WEBHOOK_SECRET || process.env.AUTH_SECRET || "";
}

export const sandboxProvider: PaymentProvider = {
  name: "sandbox",
  async createPayment(input) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SANDBOX_FORBIDDEN_IN_PRODUCTION");
    }
    return {
      providerRef: `sandbox:${input.paymentId}`,
      checkoutUrl: `${appUrl()}/checkout/sandbox/${input.paymentId}`,
      status: "PENDING",
    };
  },
  verifyWebhook(raw, signature) {
    const secret = sandboxSecret();
    if (!secret || !signature) return false;
    const expected = createHmac("sha256", secret).update(raw).digest("hex");
    const a = Buffer.from(signature.replace(/^sha256=/, ""));
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  },
};

export function signSandboxWebhook(raw: string) {
  return `sha256=${createHmac("sha256", sandboxSecret()).update(raw).digest("hex")}`;
}
