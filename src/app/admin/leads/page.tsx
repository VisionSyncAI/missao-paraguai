"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Lead = {
  id: string;
  name: string;
  companyName: string;
  status: string;
  consultant: { name: string } | null;
  presentationDownloaded: boolean;
  meetingAt: string | null;
  createdAt: string;
};

type Metrics = {
  total: number;
  downloads: number;
  funnel: Record<string, number>;
};

export default function LeadsBoardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/leads").then((r) => r.json()),
      fetch("/api/admin/metrics").then((r) => r.json()),
    ]).then(([l, m]) => {
      setLeads(l.leads || []);
      setMetrics(m);
    });
  }, []);

  return (
    <main className="min-h-dvh bg-black px-5 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-red">CRM consultivo</p>
            <h1 className="mt-2 text-4xl">Leads</h1>
          </div>
          <div className="flex items-center gap-4">
            <a className="inline-flex min-h-11 items-center text-xs uppercase tracking-widest text-gray" href="/admin/proposals">Operação</a>
            <button
              className="min-h-11 px-2 text-sm text-gray"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/admin/login";
              }}
            >
              Sair
            </button>
          </div>
        </div>
        {metrics && (
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
            {[
              ["Formulários", metrics.total],
              ["Downloads", metrics.downloads],
              ["Reuniões feitas", metrics.funnel.completed],
              ["Propostas", metrics.funnel.proposal],
              ["Fechados", metrics.funnel.won],
            ].map(([label, value]) => (
              <article key={String(label)} className="rounded-xl border border-white/10 p-4">
                <p className="text-2xl">{value}</p>
                <p className="text-xs uppercase tracking-widest text-gray">{label}</p>
              </article>
            ))}
          </div>
        )}
        <div className="-mx-5 mt-10 overflow-x-auto px-5">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-gray">
              <tr>
                <th className="py-2 pr-4">Lead</th>
                <th className="pr-4">Empresa</th>
                <th className="pr-4">Status</th>
                <th className="pr-4">Apresentação</th>
                <th>Reunião</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t border-white/10">
                  <td className="py-1 pr-4">
                    <Link className="inline-flex min-h-11 items-center text-white" href={`/admin/leads/${lead.id}`}>{lead.name}</Link>
                  </td>
                  <td className="pr-4">{lead.companyName}</td>
                  <td className="whitespace-nowrap pr-4">{lead.status}</td>
                  <td className="pr-4">{lead.presentationDownloaded ? "Baixou" : "—"}</td>
                  <td className="whitespace-nowrap">{lead.meetingAt ? new Date(lead.meetingAt).toLocaleString("pt-BR") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
