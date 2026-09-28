"use client";

import { AdminTable } from "@/components/ops/AdminTable";

export default function Page() {
  return (
    <AdminTable
      title="Documentos"
      endpoint="/api/admin/documents"
      columns={[
        { key: "name", label: "Participante" },
        { key: "type", label: "Tipo" },
        { key: "status", label: "Status" },
      ]}
    />
  );
}
