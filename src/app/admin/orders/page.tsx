"use client";

import { AdminTable } from "@/components/ops/AdminTable";

export default function Page() {
  return (
    <AdminTable
      title="Pedidos"
      endpoint="/api/admin/orders"
      columns={[
        { key: "name", label: "Nome" },
        { key: "status", label: "Status" },
        { key: "totalCents", label: "Total (centavos)" },
      ]}
    />
  );
}
