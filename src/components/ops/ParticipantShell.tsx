import Link from "next/link";
import { SiteFrame } from "@/components/SiteFrame";

const LINKS = [
  ["/participante", "Passe"],
  ["/participante/inscricao", "Inscrição"],
  ["/participante/documentos", "Documentos"],
  ["/participante/agenda", "Agenda"],
  ["/participante/reunioes", "Reuniões"],
  ["/participante/pagamentos", "Pagamentos"],
] as const;

export function ParticipantShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <SiteFrame showCta={false}>
      <main className="px-5 py-10">
        <div className="mx-auto max-w-3xl">
          <p className="font-display text-[0.92rem] font-extrabold tracking-[0.2em]">PROVISION</p>
          <p className="mt-1 text-[0.68rem] uppercase tracking-[0.14em] text-[#9a9a94]">Imersão Sem Fronteiras</p>
          <p className="mt-4 text-sm text-[#f5f5f2]">16–21 novembro 2026 · Asunción, Paraguai</p>
          <h1 className="mt-6 font-display text-4xl">{title}</h1>
          <nav aria-label="Área do participante" className="mt-6 flex flex-wrap gap-x-4 text-xs uppercase tracking-widest text-[#9a9a94]">
            {LINKS.map(([href, label]) => (
              <Link key={href} href={href} className="inline-flex min-h-11 items-center hover:text-white">
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-10">{children}</div>
        </div>
      </main>
    </SiteFrame>
  );
}
