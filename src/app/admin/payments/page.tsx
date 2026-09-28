"use client";

import { AdminTable } from "@/components/ops/AdminTable";

export default function Page() {
  return (
    <AdminTable
      title="Pagamentos"
      endpoint="/api/admin/payments"
      columns={[
        { key: "name", label: "Nome" },
        { key: "status", label: "Status" },
        { key: "amountCents", label: "Valor" },
        { key: "provider", label: "Provider" },
      ]}
    />
  );
}
