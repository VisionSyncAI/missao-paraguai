"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

export default function SandboxCheckout() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const [message, setMessage] = useState("");

  if (process.env.NODE_ENV === "production") {
    return (
      <main className="min-h-dvh bg-black p-10 text-white">
        <p>BLOCKED_BY_BUSINESS_DECISION — sandbox de pagamento não existe em produção.</p>
      </main>
    );
  }

  async function confirm(status: "paid" | "failed") {
    const payload = JSON.stringify({
      eventId: `sandbox-${paymentId}-${status}`,
      type: "payment.updated",
      paymentId,
      status,
    });
    const res = await fetch("/api/checkout/sandbox/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    });
    const json = await res.json();
    setMessage(res.ok ? `Webhook aplicado: ${json.status || "ok"}` : json.error || "falhou");
  }

  return (
    <main className="min-h-dvh bg-black px-5 py-16 text-white">
      <div className="mx-auto max-w-md">
        <p className="text-[11px] uppercase tracking-widest text-red">Sandbox (não é produção)</p>
        <h1 className="mt-2 text-4xl">Checkout de desenvolvimento</h1>
        <p className="mt-4 text-sm text-gray">Isso apenas assina um webhook local. Não confirma dinheiro real.</p>
        <div className="mt-8 flex gap-3">
          <button className="rounded-xl bg-red px-5 py-3 text-xs font-bold uppercase" onClick={() => confirm("paid")}>
            Simular pago
          </button>
          <button className="rounded-xl border border-white/20 px-5 py-3 text-xs font-bold uppercase" onClick={() => confirm("failed")}>
            Simular recusa
          </button>
        </div>
        {message && <p className="mt-4 text-sm">{message}</p>}
      </div>
    </main>
  );
}
