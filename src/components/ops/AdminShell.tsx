import Link from "next/link";

const LINKS = [
  ["/admin/leads", "Leads"],
  ["/admin/proposals", "Propostas"],
  ["/admin/registrations", "Inscrições"],
  ["/admin/participants", "Participantes"],
  ["/admin/orders", "Pedidos"],
  ["/admin/payments", "Pagamentos"],
  ["/admin/cohorts", "Turmas"],
  ["/admin/events", "Agenda"],
  ["/admin/documents", "Documentos"],
] as const;

export function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-black px-5 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-red">Operação</p>
            <h1 className="mt-2 text-4xl">{title}</h1>
          </div>
          <nav aria-label="Operação" className="flex flex-wrap gap-x-4 text-xs uppercase tracking-widest text-gray">
            {LINKS.map(([href, label]) => (
              <Link key={href} href={href} className="inline-flex min-h-11 items-center hover:text-white">
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-10">{children}</div>
      </div>
    </main>
  );
}
