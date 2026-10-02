"use client";

import { useState } from "react";
import { ParticipantShell } from "@/components/ops/ParticipantShell";
import { useParticipant } from "@/components/ops/useParticipant";

export default function Page() {
  const { data, error } = useParticipant();
  const [message, setMessage] = useState("");
  const documents = (data?.documents as { id: string; status: string; originalName: string | null }[]) || [];
  return (
    <ParticipantShell title="Documentos">
      {error && <p className="text-red">{error}</p>}
      {documents.length === 0 && !error && <p className="text-gray">Nenhum documento enviado.</p>}
      <ul className="space-y-2 text-sm">
        {documents.map((d) => (
          <li key={d.id}>
            {d.originalName || d.id} — {d.status}{" "}
            <a className="underline" href={`/api/participant/documents/${d.id}`}>baixar</a>
          </li>
        ))}
      </ul>
      <form
        className="mt-8 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const body = new FormData(form);
          const res = await fetch("/api/participant/documents", { method: "POST", body });
          setMessage(res.ok ? "Documento enviado para revisão." : "Upload recusado.");
        }}
      >
        <label className="block text-sm text-gray" htmlFor="document-type">Tipo de documento</label>
        <select id="document-type" name="typeCode" className="w-full rounded-lg border border-white/15 bg-black p-3 text-base text-white">
          <option value="PASSPORT">Passaporte</option>
          <option value="VISA">Visto / autorização</option>
          <option value="PHOTO">Foto</option>
        </select>
        <label className="block text-sm text-gray" htmlFor="document-file">Arquivo</label>
        <input id="document-file" type="file" name="file" required className="block w-full text-sm text-gray file:mr-4 file:min-h-11 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:text-white" />
        <button className="min-h-12 w-full rounded-xl bg-red px-5 py-3 text-xs font-bold uppercase tracking-widest sm:w-auto">Enviar</button>
        {message && <p className="text-sm" role="status">{message}</p>}
      </form>
    </ParticipantShell>
  );
}
