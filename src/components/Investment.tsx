"use client";

import { site, money } from "@/data/site";
import { Fade, SectionLabel } from "./ui";

export function Investment({ onCta }: { onCta: () => void }) {
  return (
    <section id="investimento" className="px-5 py-24 md:px-8">
      <Fade className="mx-auto max-w-[1440px] mb-12">
        <SectionLabel>Investimento</SectionLabel>
        <h2 className="text-[clamp(2.2rem,5vw,4.6rem)] font-semibold leading-[0.95] max-w-[16ch]">
          Você não está pagando por cinco dias.
        </h2>
        <p className="mt-6 text-xl text-gray max-w-xl">
          Está investindo em uma <span className="text-white">nova perspectiva de mercado.</span>
        </p>
      </Fade>
      <div className="mx-auto max-w-[1440px] grid md:grid-cols-2 gap-6">
        <article className="rounded-3xl border border-border bg-card p-8 md:p-12">
          <p className="text-[11px] tracking-[0.2em] uppercase text-gray">Participação individual</p>
          <p className="display text-5xl md:text-7xl mt-4">{money(site.prices.immersion)}</p>
          <p className="text-gray mt-2">por participante · {site.duration}</p>
          <p className="text-sm text-gray-dark mt-3">{site.prices.installment}</p>
          <ul className="mt-8 space-y-3 text-sm">
            {site.included.map((item) => (
              <li key={item} className="border-t border-border pt-3">✓ {item}</li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-gray">VIP Executive {money(site.prices.vip)} — agenda individualizada, não “melhor pacote”.</p>
          <p className="text-sm text-gray">Gastronomia opcional {money(site.prices.food)}.</p>
          <button type="button" onClick={onCta} className="mt-8 rounded-xl bg-red px-7 py-4 text-[12px] font-bold tracking-[0.12em] uppercase">
            Garantir minha vaga ↗
          </button>
          <p className="mt-4 text-xs text-gray">Limitadas a 15 empresários por turma.</p>
        </article>
        <article className="rounded-3xl border border-border p-8 md:p-12">
          <p className="text-[11px] tracking-[0.2em] uppercase text-gray">Não incluso</p>
          <ul className="mt-8 space-y-3 text-gray">
            {site.excluded.map((item) => (
              <li key={item} className="border-t border-border pt-3">{item}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

export function Corporate({ onCta }: { onCta: () => void }) {
  return (
    <section className="px-5 py-24 md:px-8">
      <div className="mx-auto max-w-[1440px] rounded-3xl bg-card border border-border p-8 md:p-16 grid md:grid-cols-2 gap-10">
        <div>
          <SectionLabel>Corporativo</SectionLabel>
          <h2 className="text-[clamp(2rem,4vw,3.8rem)] font-semibold leading-[0.95] max-w-[12ch]">
            Leve seu time para dentro do mercado.
          </h2>
        </div>
        <div>
          <p className="text-gray">A partir de um grupo da mesma empresa, é possível direcionar a experiência aos desafios estratégicos do time. Número mínimo · [A CONFIRMAR].</p>
          <ul className="mt-6 space-y-2 text-sm">
            <li>✓ Condições especiais · [A CONFIRMAR]</li>
            <li>✓ Agenda personalizada</li>
            <li>✓ Visitas direcionadas</li>
            <li>✓ Conteúdo por setor</li>
            <li>✓ Relatório executivo · [A CONFIRMAR]</li>
            <li>✓ Networking corporativo</li>
          </ul>
          <button type="button" onClick={onCta} className="mt-8 rounded-xl border border-white/20 px-7 py-4 text-[12px] font-bold tracking-[0.12em] uppercase hover:border-red">
            Falar com especialista ↗
          </button>
        </div>
      </div>
    </section>
  );
}
