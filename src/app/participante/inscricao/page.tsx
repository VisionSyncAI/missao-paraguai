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
          className="space-y-4"
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
          <label className="block text-sm text-gray">
            Chegada
            <textarea name="arrivalNotes" defaultValue={registration.arrivalNotes || ""} rows={3} className="mt-2 w-full rounded-lg border border-white/15 bg-black p-3 text-base text-white" />
          </label>
          <label className="block text-sm text-gray">
            Saída
            <textarea name="departureNotes" defaultValue={registration.departureNotes || ""} rows={3} className="mt-2 w-full rounded-lg border border-white/15 bg-black p-3 text-base text-white" />
          </label>
          <label className="block text-sm text-gray">
            Alimentação
            <textarea name="dietaryNotes" defaultValue={registration.dietaryNotes || ""} rows={3} className="mt-2 w-full rounded-lg border border-white/15 bg-black p-3 text-base text-white" />
          </label>
          <label className="block text-sm text-gray">
            Interesses de networking
            <textarea name="networkingNotes" rows={3} className="mt-2 w-full rounded-lg border border-white/15 bg-black p-3 text-base text-white" />
          </label>
          <button className="min-h-12 w-full rounded-xl bg-red px-5 py-3 text-xs font-bold uppercase tracking-widest sm:w-auto">Salvar ficha</button>
          {message && <p className="text-sm" role="status">{message}</p>}
        </form>
      )}
    </ParticipantShell>
  );
}
