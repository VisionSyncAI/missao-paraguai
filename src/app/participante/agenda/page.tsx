"use client";

import { ParticipantShell } from "@/components/ops/ParticipantShell";
import { useParticipant } from "@/components/ops/useParticipant";

export default function Page() {
  const { data, error } = useParticipant();
  const events = (data?.events as { id: string; title: string; type: string; startsAt: string; location: string | null }[]) || [];
  return (
    <ParticipantShell title="Agenda da missão">
      {error && <p className="text-red">{error}</p>}
      {events.length === 0 && <p className="text-gray">A programação da turma ainda não foi publicada.</p>}
      <ul className="space-y-3">
        {events.map((event) => (
          <li key={event.id} className="rounded-xl border border-white/10 p-4">
            <p>{event.title}</p>
            <p className="text-sm text-gray">{event.type} · {new Date(event.startsAt).toLocaleString("pt-BR")} · {event.location || "local a definir"}</p>
          </li>
        ))}
      </ul>
    </ParticipantShell>
  );
}
