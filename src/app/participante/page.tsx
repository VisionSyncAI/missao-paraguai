"use client";

import { ParticipantShell } from "@/components/ops/ParticipantShell";
import { useParticipant } from "@/components/ops/useParticipant";

export default function Page() {
  const { data, error } = useParticipant();
  return (
    <ParticipantShell title="Painel">
      {error && <p className="text-red">{error}</p>}
      {!data && !error && <p className="text-gray">Carregando…</p>}
      {data && (
        <div className="space-y-3 text-sm">
          <p>{String(data.name)}</p>
          <p className="text-gray">Status: {String(data.status)}</p>
          <p className="text-gray">Turma: {String((data.cohort as { name?: string } | null)?.name || "não alocada")}</p>
        </div>
      )}
    </ParticipantShell>
  );
}
