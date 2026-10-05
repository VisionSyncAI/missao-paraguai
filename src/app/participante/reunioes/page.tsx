"use client";

import { ParticipantShell } from "@/components/ops/ParticipantShell";
import { useParticipant } from "@/components/ops/useParticipant";

type Meeting = { id: string; scheduledAt: string; status: string; meetingUrl: string | null; consultant: { name: string } | null };

export default function Page() {
  const { data, error } = useParticipant();
  const meetings = (data?.meetings as Meeting[]) || [];
  return (
    <ParticipantShell title="Reuniões">
      {error && <p className="text-[#d71920]">{error}</p>}
      {!data && !error && <p className="text-[#9a9a94]">Carregando…</p>}
      {data && meetings.length === 0 && <p className="text-[#9a9a94]">Aguardando atualização.</p>}
      <ul className="space-y-3">
        {meetings.map((meeting) => (
          <li key={meeting.id} className="border border-white/12 p-4">
            <p>{new Date(meeting.scheduledAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</p>
            <p className="mt-1 text-sm text-[#9a9a94]">{meeting.status}{meeting.consultant?.name ? ` · ${meeting.consultant.name}` : ""}</p>
            {meeting.meetingUrl ? (
              <a className="mt-3 inline-flex min-h-11 items-center text-sm underline" href={meeting.meetingUrl}>Abrir sala</a>
            ) : null}
          </li>
        ))}
      </ul>
    </ParticipantShell>
  );
}
