"use client";

import { AdminTable } from "@/components/ops/AdminTable";

export default function Page() {
  return (
    <AdminTable
      title="Turmas"
      endpoint="/api/admin/cohorts"
      columns={[
        { key: "name", label: "Nome" },
        { key: "capacity", label: "Capacidade" },
        { key: "seatsTaken", label: "Ocupadas" },
        { key: "status", label: "Status" },
        { key: "isPublic", label: "Pública" },
      ]}
    />
  );
}
