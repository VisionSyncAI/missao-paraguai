"use client";

import Image from "next/image";
import { nav } from "@/data/site";

export function FinalCTA({ onCta }: { onCta: () => void }) {
  return (
    <section className="relative min-h-[80vh] overflow-hidden">
      <Image src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=2000&q=70" alt="Cidade à noite" fill className="object-cover" />
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-[1440px] flex-col justify-end px-5 py-20 md:px-8">
        <h2 className="max-w-[14ch] text-[clamp(2.4rem,6vw,5.4rem)] font-semibold leading-[0.92]">
          Conhecer o Paraguai é fácil.
          <br />Entender o Paraguai é outra coisa.
        </h2>
        <p className="mt-6 display text-4xl text-red">Esteja dentro.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={onCta} className="rounded-xl bg-red px-7 py-4 text-[12px] font-bold tracking-[0.12em] uppercase">
            Garantir minha vaga ↗
          </button>
          <button type="button" onClick={onCta} className="rounded-xl border border-border px-7 py-4 text-[12px] font-bold tracking-[0.12em] uppercase">
            Falar com especialista
          </button>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border px-5 py-16 md:px-8">
      <div className="mx-auto max-w-[1440px] flex flex-col md:flex-row justify-between gap-8">
        <div>
          <p className="text-[10px] tracking-[0.28em] text-gray">IMERSÃO</p>
          <p className="display text-2xl">PARAGUAI</p>
          <p className="text-gray mt-4 max-w-sm">Uma experiência de negócios, conexões e visão de mercado.</p>
          <p className="text-xs text-gray-dark mt-3">Vision Cybero AI × Proceit</p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm text-gray">
          {nav.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
          <a href="#investimento">Contato</a>
        </nav>
      </div>
      <p className="mx-auto max-w-[1440px] mt-10 text-xs text-gray-dark">
        As informações possuem caráter informativo e estratégico. A imersão não constitui aconselhamento jurídico, tributário ou financeiro e não garante retorno, aprovação de investimentos ou concessão de documentos.
      </p>
    </footer>
  );
}

export function MobileBar({ onCta }: { onCta: () => void }) {
  return (
    <div className="md:hidden fixed bottom-3 inset-x-3 z-40">
      <button type="button" onClick={onCta} className="w-full rounded-xl bg-red py-4 text-[12px] font-bold tracking-[0.12em] uppercase shadow-lg">
        Garantir minha vaga ↗
      </button>
    </div>
  );
}
