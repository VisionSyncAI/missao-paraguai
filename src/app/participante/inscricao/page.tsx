"use client";

import { useState } from "react";
import { ParticipantShell } from "@/components/ops/ParticipantShell";
import { useParticipant } from "@/components/ops/useParticipant";

export default function Page() {
  const { data, error } = useParticipant();
  const [message, setMessage] = useState("");
  const registration = data?.registration as Record<string, string> | undefined;
  return (
    <ParticipantShell title="Inscrição">
      {error && <p className="text-red">{error}</p>}
      {registration && (
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const res = await fetch("/api/participant/registration", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                arrivalNotes: form.get("arrivalNotes"),
                departureNotes: form.get("departureNotes"),
                dietaryNotes: form.get("dietaryNotes"),
                networkingNotes: form.get("networkingNotes"),
                status: "SUBMITTED",
              }),
            });
            setMessage(res.ok ? "Ficha atualizada." : "Não foi possível salvar.");
          }}
        >
          <p className="text-sm text-gray">Status: {registration.status}</p>
          <textarea name="arrivalNotes" defaultValue={registration.arrivalNotes || ""} className="w-full rounded-lg border border-white/15 bg-black p-3" placeholder="Chegada" />
          <textarea name="departureNotes" defaultValue={registration.departureNotes || ""} className="w-full rounded-lg border border-white/15 bg-black p-3" placeholder="Saída" />
          <textarea name="dietaryNotes" defaultValue={registration.dietaryNotes || ""} className="w-full rounded-lg border border-white/15 bg-black p-3" placeholder="Alimentação" />
          <textarea name="networkingNotes" className="w-full rounded-lg border border-white/15 bg-black p-3" placeholder="Interesses de networking" />
          <button className="rounded-xl bg-red px-5 py-3 text-xs font-bold uppercase tracking-widest">Salvar ficha</button>
          {message && <p className="text-sm">{message}</p>}
        </form>
      )}
    </ParticipantShell>
  );
}
