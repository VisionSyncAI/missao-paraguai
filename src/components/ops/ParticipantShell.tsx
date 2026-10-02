import Link from "next/link";

const LINKS = [
  ["/participante", "Início"],
  ["/participante/inscricao", "Inscrição"],
  ["/participante/documentos", "Documentos"],
  ["/participante/agenda", "Agenda"],
  ["/participante/reunioes", "Reuniões"],
  ["/participante/pagamentos", "Pagamentos"],
] as const;

export function ParticipantShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-black px-5 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <p className="text-[11px] tracking-[0.2em] uppercase text-red">Área do participante</p>
        <h1 className="mt-2 text-4xl">{title}</h1>
        <nav aria-label="Área do participante" className="mt-6 flex flex-wrap gap-x-4 text-xs uppercase tracking-widest text-gray">
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} className="inline-flex min-h-11 items-center hover:text-white">
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-10">{children}</div>
      </div>
    </main>
  );
}
