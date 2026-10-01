"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { LEAD_STATUSES } from "@/modules/leads/status";

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const [lead, setLead] = useState<Record<string, unknown> | null>(null);
  const [timeline, setTimeline] = useState<{ createdAt: string; type: string; body: string }[]>([]);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const [l, t] = await Promise.all([
      fetch(`/api/admin/leads/${params.id}`).then((r) => r.json()),
      fetch(`/api/admin/leads/${params.id}/timeline`).then((r) => r.json()),
    ]);
    setLead(l.lead);
    setStatus(l.lead?.status || "");
    setNotes(l.lead?.notes || "");
    setTimeline(t.activities || []);
  }

  useEffect(() => {
    load();
  }, [params.id]);

  if (!lead) return <main className="min-h-dvh bg-black p-10 text-white">Carregando…</main>;

  return (
    <main className="min-h-dvh bg-black px-5 py-10 text-white">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
        <section>
          <a href="/admin/leads" className="text-sm text-gray">← Pipeline</a>
          <h1 className="mt-4 text-4xl">{String(lead.name)}</h1>
          <p className="mt-2 text-gray">{String(lead.companyName)} · {String(lead.jobTitle || "—")}</p>
          <p className="mt-1 text-sm">{String(lead.email)} · {String(lead.whatsapp)}</p>
          <p className="mt-1 text-sm text-gray">CPF {String(lead.cpfMasked)} · CNPJ {String(lead.cnpj)}</p>
          <div className="mt-6 text-sm text-gray">
            {(lead.objectives as string[] | undefined)?.join(" · ")}
          </div>
          <p className="mt-4">{String(lead.objectiveNotes || "")}</p>
          {typeof lead.qualification === "object" && lead.qualification !== null ? (
            <ul className="mt-6 space-y-1 text-sm text-gray">
              <li>Porte: {String((lead.qualification as Record<string, string>).companySize || "—")}</li>
              <li>Relação PY: {String((lead.qualification as Record<string, string>).relationship || "—")}</li>
              <li>Intenção: {String((lead.qualification as Record<string, string>).intent || "—")}</li>
              <li>Delegação: {String((lead.qualification as Record<string, string>).delegationSize || "—")}</li>
              <li>Acompanhante adicional: {(lead.qualification as Record<string, boolean>).companionRequested ? "sim, ingresso separado" : "não"}</li>
            </ul>
          ) : null}
          <ul className="mt-6 space-y-1 text-sm">
            <li>Paraguai: {lead.beenToParaguay ? "já esteve" : "não"}</li>
            <li>Negócios no PY: {lead.hasBusinessParaguay ? "sim" : "não"}</li>
            <li>B2B: {lead.interestB2B ? "sim" : "não"}</li>
            <li>Visitas industriais: {lead.interestIndustry ? "sim" : "não"}</li>
            <li>Acompanhantes: {String(lead.companionCount)}</li>
            <li>Apresentação: {lead.presentationDownloaded ? "baixou" : "ainda não"}</li>
          </ul>
        </section>
        <section className="rounded-2xl border border-white/10 p-6">
          <label className="text-xs uppercase tracking-widest text-gray">Estágio
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-2 w-full rounded-lg border border-white/15 bg-black p-3">
              {LEAD_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-4 w-full rounded-lg border border-white/15 bg-black p-3" rows={5} placeholder="Observações" />
          <button
            className="mt-4 rounded-xl bg-red px-5 py-3 text-xs font-bold uppercase tracking-widest"
            onClick={async () => {
              const res = await fetch(`/api/admin/leads/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, notes }),
              });
              const json = await res.json();
              setMessage(res.ok ? "Atualizado" : json.error);
              load();
            }}
          >
            Salvar estágio
          </button>
          {Boolean(lead.meetingId) && (
            <button
              className="ml-3 mt-4 rounded-xl border border-white/20 px-5 py-3 text-xs font-bold uppercase tracking-widest"
              onClick={async () => {
                const res = await fetch(`/api/admin/meetings/${String(lead.meetingId)}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: "COMPLETED" }),
                });
                setMessage(res.ok ? "Reunião realizada" : "Não foi possível atualizar a reunião");
                load();
              }}
            >
              Marcar reunião realizada
            </button>
          )}
          <div className="mt-6 border-t border-white/10 pt-6">
            <p className="text-xs uppercase tracking-widest text-gray">Proposta</p>
            <button
              className="mt-3 rounded-xl border border-white/20 px-5 py-3 text-xs font-bold uppercase tracking-widest"
              onClick={async () => {
                const res = await fetch("/api/admin/proposals", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ leadId: params.id, productCode: "EXECUTIVE" }),
                });
                const json = await res.json();
                setMessage(res.ok ? `Proposta ${json.proposal.id}` : json.error);
                if (res.ok && json.proposal?.id) {
                  const acc = await fetch(`/api/admin/proposals/${json.proposal.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "ACCEPTED" }),
                  });
                  const accJson = await acc.json();
                  setMessage(acc.ok ? "Proposta aceita · ficha criada" : accJson.error);
                }
                load();
              }}
            >
              Criar proposta EXECUTIVE (preço oficial no servidor)
            </button>
          </div>
          {message && <p className="mt-3 text-sm">{message}</p>}
          <ol className="mt-8 space-y-3 text-sm">
            {timeline.map((item) => (
              <li key={item.createdAt + item.type}>
                <p className="text-gray">{new Date(item.createdAt).toLocaleString("pt-BR")}</p>
                <p>{item.body}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
