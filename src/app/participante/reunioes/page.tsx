"use client";

import { ParticipantShell } from "@/components/ops/ParticipantShell";

export default function Page() {
  return (
    <ParticipantShell title="Reuniões">
      <p className="text-gray">
        Reuniões comerciais ficam no histórico do CRM. Reuniões de networking da missão serão listadas aqui quando a operação as criar na agenda.
      </p>
    </ParticipantShell>
  );
}
