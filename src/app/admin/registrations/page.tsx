"use client";

import { AdminTable } from "@/components/ops/AdminTable";

export default function Page() {
  return (
    <AdminTable
      title="Inscrições"
      endpoint="/api/admin/registrations"
      columns={[
        { key: "name", label: "Nome" },
        { key: "status", label: "Status" },
        { key: "cohort", label: "Turma" },
        { key: "participantStatus", label: "Participante" },
      ]}
    />
  );
}
