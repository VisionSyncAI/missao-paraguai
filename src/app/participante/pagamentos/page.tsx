"use client";

import { ParticipantShell } from "@/components/ops/ParticipantShell";
import { useParticipant } from "@/components/ops/useParticipant";

export default function Page() {
  const { data, error } = useParticipant();
  const orders = (data?.orders as { id: string; status: string; totalCents: number; payments: { id: string; status: string; checkoutUrl: string | null }[] }[]) || [];
  return (
    <ParticipantShell title="Pagamentos">
      {error && <p className="text-red">{error}</p>}
      {orders.length === 0 && <p className="text-gray">Nenhum pedido. O valor oficial só existe depois da decisão comercial e da Order no servidor.</p>}
      <ul className="space-y-3">
        {orders.map((order) => (
          <li key={order.id} className="rounded-xl border border-white/10 p-4">
            <p>Pedido {order.status} — {order.totalCents} centavos</p>
            {order.payments.map((p) => (
              <p key={p.id} className="text-sm text-gray">
                {p.status} {p.checkoutUrl ? <a className="underline" href={p.checkoutUrl}>checkout</a> : ""}
              </p>
            ))}
          </li>
        ))}
      </ul>
    </ParticipantShell>
  );
}
