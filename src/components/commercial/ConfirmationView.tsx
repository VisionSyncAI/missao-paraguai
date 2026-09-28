"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Data = {
  name: string;
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
    if (!token) {
      setError("Link inválido.");
      return;
    }
    fetch(`/api/leads/me?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("not found");
        setData(await r.json());
      })
      .catch(() => setError("Não encontramos esta pré-inscrição."));
  }, [token]);

  if (error) return <p className="text-red">{error}</p>;
  if (!data) return <p className="text-gray">Carregando confirmação…</p>;

  const when = data.scheduledAt
    ? new Date(data.scheduledAt).toLocaleString("pt-BR", { dateStyle: "full", timeStyle: "short" })
    : "—";

  return (
    <div className="grid gap-8">
      <div>
        <p className="text-[11px] tracking-[0.28em] uppercase text-red">Pré-inscrição recebida</p>
        <h1 className="mt-4 text-4xl md:text-6xl leading-[0.95]">Obrigado, {data.name.split(" ")[0]}.</h1>
        <p className="mt-5 max-w-xl text-gray">
          Nossa equipe recebeu seus dados. Agora você pode conhecer a experiência executiva e confirmar sua conversa com o consultor.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <a className="rounded-xl bg-red px-6 py-4 text-xs font-bold tracking-[0.12em] uppercase" href={`/api/presentations/download?token=${encodeURIComponent(token)}`}>
          Baixar apresentação
        </a>
        {data.meetingUrl && (
          <a className="rounded-xl border border-white/20 px-6 py-4 text-xs font-bold tracking-[0.12em] uppercase" href={data.meetingUrl}>
            Acessar reunião
          </a>
        )}
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
