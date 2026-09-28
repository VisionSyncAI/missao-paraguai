"use client";

import { AdminTable } from "@/components/ops/AdminTable";

export default function Page() {
  return (
    <AdminTable
      title="Agenda da missão"
      endpoint="/api/admin/events"
      columns={[
        { key: "title", label: "Evento" },
        { key: "type", label: "Tipo" },
        { key: "startsAt", label: "Início" },
      ]}
    />
  );
}
