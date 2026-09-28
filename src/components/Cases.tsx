"use client";

import { cases, takeaways, deliverables } from "@/data/site";
import { Fade, SectionLabel } from "./ui";

export function Cases() {
  return (
    <section id="cases" className="px-5 py-24 md:px-8">
      <Fade className="mx-auto max-w-[1440px] mb-10">
        <SectionLabel>Cases</SectionLabel>
        <h2 className="text-[clamp(2.2rem,5vw,4.4rem)] font-semibold leading-[0.95] max-w-[16ch]">
          Não é sobre o que dizem. É sobre o que fizeram depois.
        </h2>
      </Fade>
      <div className="mx-auto max-w-[1440px] grid md:grid-cols-3 gap-4">
        {cases.map((item) => (
          <article key={item.role} className="rounded-2xl border border-border bg-card p-8 group">
            <div className="h-40 rounded-xl bg-black-soft mb-6 relative overflow-hidden grayscale group-hover:grayscale-0 transition">
              <button type="button" aria-label="Play" className="absolute inset-0 m-auto h-14 w-14 rounded-full bg-red">▶</button>
            </div>
            <p className="text-gray text-sm">{item.role} · {item.company}</p>
            <h3 className="display text-2xl mt-1">{item.name}</h3>
            <p className="mt-4 text-gray">{item.quote}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function WhatYouTake() {
  return (
    <section className="px-5 py-24 md:px-8">
      <Fade className="mx-auto max-w-[1440px] mb-10">
        <SectionLabel>Retorno</SectionLabel>
        <h2 className="text-[clamp(2.2rem,5vw,4.4rem)] font-semibold leading-[0.95] max-w-[12ch]">O que você leva de volta?</h2>
        <p className="mt-6 max-w-xl text-gray">Você não volta apenas com fotos. Volta com contexto, conexões e decisões mais bem informadas.</p>
      </Fade>
      <div className="mx-auto max-w-[1440px] grid grid-cols-2 md:grid-cols-3 gap-px bg-border">
        {takeaways.map((item) => (
          <article key={item.n} className="bg-black p-8">
            <p className="text-red">{item.n}</p>
            <h3 className="display text-2xl mt-6">{item.title}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Deliverables() {
  return (
    <section className="px-5 py-24 md:px-8">
      <Fade className="mx-auto max-w-[1440px] mb-10">
        <SectionLabel>Entregáveis</SectionLabel>
        <h2 className="text-[clamp(2.2rem,5vw,4.4rem)] font-semibold leading-[0.95] max-w-[14ch]">
          Conhecimento que continua depois da viagem.
        </h2>
      </Fade>
      <div className="mx-auto max-w-[1440px] grid md:grid-cols-3 gap-4">
        {deliverables.map((item) => (
          <article key={item.title} className="rounded-2xl border border-border p-7 bg-card">
            <div className="h-24 rounded-lg border border-border mb-5 bg-[repeating-linear-gradient(90deg,transparent,transparent_8px,rgba(255,255,255,0.04)_8px,rgba(255,255,255,0.04)_9px)]" />
            <h3 className="display text-xl">{item.title}</h3>
            <p className="text-gray text-sm mt-3">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
