import { prisma } from "@/lib/prisma";
import { formatSaoPaulo } from "@/lib/timezone";

export default async function ReuniaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: { consultant: true },
  });
  if (!meeting) {
    return (
      <main className="min-h-dvh bg-black p-10 text-white">
        <p>Reunião não encontrada.</p>
      </main>
    );
  }
  return (
    <main className="min-h-dvh bg-black px-5 py-16 text-white">
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-[#0c0c0c] p-8">
        <p className="text-[11px] tracking-[0.2em] uppercase text-red">Reunião PROVISION</p>
        <h1 className="mt-4 text-3xl">{meeting.consultant.name}</h1>
        <p className="mt-3 text-gray">{formatSaoPaulo(meeting.scheduledAt)}</p>
        <p className="mt-6 text-sm text-gray">
          Esta é a sala da conversa comercial. O consultor confirmará o acesso no horário agendado.
          Não compartilhe dados de CPF ou restrições alimentares neste canal.
        </p>
        <p className="mt-6 text-sm">Status: {meeting.status}</p>
      </div>
    </main>
  );
}
