"use client";

import { AdminTable } from "@/components/ops/AdminTable";

export default function Page() {
  return (
    <AdminTable
      title="Participantes"
      endpoint="/api/admin/participants"
      columns={[
        { key: "name", label: "Nome" },
        { key: "status", label: "Status" },
        { key: "waitlisted", label: "Fila" },
        { key: "cohort", label: "Turma" },
      ]}
    />
  );
}
