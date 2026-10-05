"use client";

import { ParticipantShell } from "@/components/ops/ParticipantShell";
import { useParticipant } from "@/components/ops/useParticipant";

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: "Pagamento pendente",
  CONFIRMED: "Confirmada",
  DRAFT: "Rascunho",
  SUBMITTED: "Inscrição enviada",
  PAID: "Paga",
};

type Doc = { id: string; status: string; originalName: string | null };
type Pay = { id: string; status: string; checkoutUrl: string | null };
type Order = { id: string; status: string; payments: Pay[] };
type Meeting = { id: string; scheduledAt: string; status: string; meetingUrl: string | null; consultant: { name: string } | null };

function label(status: string) {
  return STATUS_LABEL[status] || status;
}

export default function Page() {
  const { data, error } = useParticipant();
  const documents = (data?.documents as Doc[]) || [];
  const orders = (data?.orders as Order[]) || [];
  const meetings = (data?.meetings as Meeting[]) || [];
  const pendingDoc = documents.find((doc) => doc.status !== "APPROVED");
  const pendingPay = orders.flatMap((order) => order.payments).find((pay) => pay.status === "PENDING" && pay.checkoutUrl);
  const nextMeeting = meetings.find((meeting) => meeting.status === "SCHEDULED" && new Date(meeting.scheduledAt).getTime() >= Date.now()) || meetings.find((meeting) => meeting.status === "SCHEDULED");
  const company = typeof data?.companyName === "string" && data.companyName.trim() ? data.companyName : "";

  let next = "Aguardando atualização.";
  if (pendingDoc) next = pendingDoc.originalName ? `Documento: ${pendingDoc.originalName}` : "Há um documento pendente.";
  else if (pendingPay) next = "Há um pagamento pendente.";
  else if (nextMeeting) next = new Date(nextMeeting.scheduledAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

  return (
    <ParticipantShell title="Passe do delegado">
      {error && <p className="text-[#d71920]">{error === "UNAUTHENTICATED" ? "Entre com o link enviado para ver o seu passe." : error}</p>}
      {!data && !error && <p className="text-[#9a9a94]">Carregando…</p>}
      {data && (
        <article className="border border-white/12 p-6 md:p-8">
          <dl className="grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-[#c9a96a]">Participante</dt>
              <dd className="mt-2 text-xl">{String(data.name || "Aguardando atualização.")}</dd>
            </div>
            <div>
              <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-[#c9a96a]">Empresa</dt>
              <dd className="mt-2 text-xl">{company || "Aguardando atualização."}</dd>
            </div>
            <div>
              <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-[#c9a96a]">Status da participação</dt>
              <dd className="mt-2 text-xl">{label(String(data.status || "")) || "Aguardando atualização."}</dd>
            </div>
            <div>
              <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-[#c9a96a]">Hotel</dt>
              <dd className="mt-2 text-xl">Crowne Plaza Asunción</dd>
            </div>
            <div>
              <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-[#c9a96a]">Documento pendente</dt>
              <dd className="mt-2">{pendingDoc ? (pendingDoc.originalName || pendingDoc.status) : "Nenhum documento pendente."}</dd>
            </div>
            <div>
              <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-[#c9a96a]">Próxima conversa</dt>
              <dd className="mt-2">
                {nextMeeting
                  ? `${new Date(nextMeeting.scheduledAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}${nextMeeting.consultant?.name ? ` · ${nextMeeting.consultant.name}` : ""}`
                  : "Aguardando atualização."}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-[#c9a96a]">Sua hipótese</dt>
              <dd className="mt-2">Aguardando atualização.</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-[#c9a96a]">Sua agenda</dt>
              <dd className="mt-2 grid gap-1 text-sm text-[#d6d6d0]">
                <span>16 — Chegada</span>
                <span>17 — Ambiente empresarial</span>
                <span>18 — Instituições</span>
                <span>19 — Operações</span>
                <span>20 — Business Day</span>
                <span>21 — Mapa de decisão</span>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-[#c9a96a]">Seus encontros</dt>
              <dd className="mt-2">
                {meetings.length
                  ? meetings.map((meeting) => (
                      <p key={meeting.id}>
                        {new Date(meeting.scheduledAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                        {meeting.consultant?.name ? ` · ${meeting.consultant.name}` : ""}
                        {` · ${label(meeting.status)}`}
                      </p>
                    ))
                  : "Aguardando atualização."}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-[#c9a96a]">Seu mapa</dt>
              <dd className="mt-2 grid gap-1 text-sm text-[#d6d6d0]">
                <span>O que confirmei — Aguardando atualização.</span>
                <span>O que falta — Aguardando atualização.</span>
                <span>Próximo passo — {next}</span>
              </dd>
            </div>
          </dl>
        </article>
      )}
    </ParticipantShell>
  );
}
