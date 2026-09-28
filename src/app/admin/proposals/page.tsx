"use client";

import { AdminTable } from "@/components/ops/AdminTable";

export default function Page() {
  return (
    <AdminTable
      title="Propostas"
      endpoint="/api/admin/proposals"
      columns={[
        { key: "leadName", label: "Lead" },
        { key: "status", label: "Status" },
        { key: "id", label: "ID" },
      ]}
    />
  );
}
