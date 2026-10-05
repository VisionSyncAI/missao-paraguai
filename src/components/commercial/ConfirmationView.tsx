"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { isLiveMeetingLink } from "@/lib/meetingLink";
import { formatSaoPaulo } from "@/lib/timezone";

type Data = {
  name: string;
  email?: string;
  consultantName: string | null;
  scheduledAt: string | null;
  meetingUrl: string | null;
  downloaded: boolean;
};

export function ConfirmationView() {
  const params = useSearchParams();
  const token = params.get("t") || "";
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const url = token ? `/api/leads/me?token=${encodeURIComponent(token)}` : "/api/leads/me";
    fetch(url, { credentials: "same-origin" })
      .then(async (r) => {
        if (!r.ok) throw new Error("not found");
        setData(await r.json());
      })
      .catch(() => setError("Não encontramos esta pré-inscrição."));
  }, [token]);

  if (error) return <p className="text-red">{error}</p>;
  if (!data) return <p className="text-gray">Carregando confirmação…</p>;

  const when = data.scheduledAt ? formatSaoPaulo(new Date(data.scheduledAt)) : "—";

  return (
    <div className="grid gap-8">
      <div>
        <p className="text-[11px] tracking-[0.28em] uppercase text-red">Hipótese recebida</p>
        <h1 className="mt-4 text-4xl md:text-6xl leading-[0.95]">Sua hipótese foi recebida, {data.name.split(" ")[0]}.</h1>
        <p className="mt-5 max-w-xl text-gray">
          O próximo passo é a conversa com um consultor. Ele entra em contato para entender a empresa, o objetivo e a condição de participação. Sem pagamento nesta etapa.
        </p>
        <ol className="mt-6 flex flex-wrap gap-x-3 gap-y-2 text-[0.72rem] uppercase tracking-[0.14em] text-[#9a9a94]">
          <li>Conversa</li>
          <li aria-hidden="true">→</li>
          <li>Contrato</li>
          <li aria-hidden="true">→</li>
          <li>Pagamento</li>
          <li aria-hidden="true">→</li>
          <li>Preparação</li>
        </ol>
      </div>
      <div className="flex flex-wrap gap-3">
        <a className="rounded-xl bg-red px-6 py-4 text-xs font-bold tracking-[0.12em] uppercase" href={token ? `/api/presentations/download?token=${encodeURIComponent(token)}` : "/api/presentations/download"}>
          Baixar apresentação
        </a>
        {isLiveMeetingLink(data.meetingUrl) ? (
          <a
            className="rounded-xl border border-white/20 px-6 py-4 text-xs font-bold tracking-[0.12em] uppercase"
            href={data.meetingUrl || undefined}
            target="_blank"
            rel="noreferrer"
          >
            Abrir sala da reunião
          </a>
        ) : data.scheduledAt ? (
          <p className="max-w-md text-sm text-gray">
            O consultor vai chamar você pelo WhatsApp informado no horário marcado.
          </p>
        ) : null}
      </div>
      <article className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-6">
        <p className="text-[11px] tracking-[0.2em] uppercase text-red">Sua conversa</p>
        <p className="mt-4 text-xl">{when}</p>
        <p className="mt-2 text-gray">Consultor: {data.consultantName}</p>
        <p className="mt-1 text-gray">Reunião online</p>
      </article>
    </div>
  );
}
