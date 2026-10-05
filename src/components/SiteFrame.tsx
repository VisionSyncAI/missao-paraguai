import type { ReactNode } from "react";

const LINKS = [
  ["/#para-quem", "Para quem"],
  ["/#agenda", "Agenda"],
  ["/#provas", "Prova"],
  ["/#investimento", "Investimento"],
  ["/#faq", "FAQ"],
] as const;

/** Same identity as the static home: PROVISION first, one red, one primary action. */
export function SiteFrame({ children, showCta = true }: { children: ReactNode; showCta?: boolean }) {
  return (
    <div className="min-h-dvh bg-[#050505] text-[#f5f5f2]">
      <a className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-white focus:px-3 focus:py-2 focus:text-black" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050505]/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between gap-4 px-5">
          <a href="/" className="leading-none">
            <span className="block font-display text-[0.92rem] font-extrabold tracking-[0.2em]">PROVISION</span>
            <span className="mt-1 block text-[0.62rem] uppercase tracking-[0.12em] text-[#9a9a94]">Imersão Sem Fronteiras</span>
          </a>
          <nav aria-label="Seções" className="hidden items-center gap-5 text-[0.68rem] uppercase tracking-[0.16em] text-white/75 lg:flex">
            {LINKS.map(([href, label]) => (
              <a key={href} href={href} className="hover:text-white">{label}</a>
            ))}
          </nav>
          {showCta ? (
            <a href="/interesse" className="inline-flex min-h-11 items-center rounded-[10px] bg-[#d71920] px-4 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white">
              Quero participar
            </a>
          ) : null}
        </div>
      </header>
      <div id="conteudo">{children}</div>
      <footer className="border-t border-white/10 px-5 py-14 text-[#9a9a94]">
        <div className="mx-auto max-w-[1440px]">
          <p className="text-[0.68rem] uppercase tracking-[0.22em]">Realização</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="grid gap-4 rounded-[18px] border border-white/10 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <img className="h-11 w-auto" src="/logos/proceit-sm.png" alt="PROCEIT" />
                <p className="text-[0.68rem] uppercase tracking-[0.16em] text-[#c9a96a]">Organização no Paraguai</p>
              </div>
              <p>Coordenação local, relacionamento empresarial e institucional e organização da agenda no Paraguai.</p>
              <div className="flex items-center gap-4 border-t border-white/10 pt-4">
                <img className="h-[72px] w-[72px] rounded-full object-cover" src="/curators/magno-oliveira.jpg" alt="Magno Oliveira" width={336} height={336} />
                <div>
                  <strong className="block font-display text-lg uppercase text-[#f5f5f2]">Magno Oliveira</strong>
                  <span className="text-[0.68rem] uppercase tracking-[0.12em]">Curador · CEO, PROCEIT</span>
                </div>
              </div>
            </article>
            <article className="grid gap-4 rounded-[18px] border border-white/10 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <img className="h-11 w-auto" src="/logos/vision-cybero-sm.png" alt="Vision Cybero AI" />
                <p className="text-[0.68rem] uppercase tracking-[0.16em] text-[#c9a96a]">Organização no Brasil</p>
              </div>
              <p>Coordenação no Brasil, atendimento aos participantes brasileiros e tecnologia de tradução por IA.</p>
              <div className="flex items-center gap-4 border-t border-white/10 pt-4">
                <img className="h-[72px] w-[72px] rounded-full object-cover" src="/curators/tachieli-lopes.jpg" alt="Tachieli Lopes" width={336} height={336} />
                <div>
                  <strong className="block font-display text-lg uppercase text-[#f5f5f2]">Tachieli Lopes</strong>
                  <span className="text-[0.68rem] uppercase tracking-[0.12em]">Curadora · CTO, Vision Cybero AI</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </footer>
    </div>
  );
}
