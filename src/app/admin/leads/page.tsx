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
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-red">CRM consultivo</p>
            <h1 className="mt-2 text-4xl">Leads</h1>
          </div>
          <div className="flex items-center gap-4">
            <a className="text-xs uppercase tracking-widest text-gray" href="/admin/proposals">Operação</a>
            <button
              className="text-sm text-gray"
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
        <div className="mt-10 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-gray">
              <tr>
                <th className="py-2">Lead</th>
                <th>Empresa</th>
                <th>Status</th>
                <th>Apresentação</th>
                <th>Reunião</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t border-white/10">
                  <td className="py-3">
                    <Link className="text-white" href={`/admin/leads/${lead.id}`}>{lead.name}</Link>
                  </td>
                  <td>{lead.companyName}</td>
                  <td>{lead.status}</td>
                  <td>{lead.presentationDownloaded ? "Baixou" : "—"}</td>
                  <td>{lead.meetingAt ? new Date(lead.meetingAt).toLocaleString("pt-BR") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
