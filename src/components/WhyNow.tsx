"use client";

import { Fade, SectionLabel } from "./ui";
import { site } from "@/data/site";

export function ImpactPhrase() {
  return (
    <section className="px-5 py-28 md:px-8">
      <Fade className="mx-auto max-w-[1100px]">
        <p className="display text-[clamp(2.4rem,7vw,6rem)] leading-[0.92] font-semibold">
          Não é uma viagem.
          <br />É <span className="text-red">acesso.</span>
        </p>
        <p className="mt-10 max-w-xl text-lg text-gray">
          Você não vai apenas conhecer o Paraguai.
          Vai entender como empresas <span className="text-white">operam</span>,
          como negócios são <span className="text-white">construídos</span>
          {" "}e onde estão as <span className="text-red">oportunidades</span>.
        </p>
      </Fade>
    </section>
  );
}

export function WhyNow() {
  return (
    <section id="por-que-agora" className="px-5 py-24 md:px-8">
      <div className="mx-auto grid max-w-[1440px] gap-12 md:grid-cols-2">
        <Fade>
          <SectionLabel>Por que agora</SectionLabel>
          <h2 className="text-[clamp(2.2rem,5vw,4.6rem)] font-semibold leading-[0.95]">
            Por que olhar para o Paraguai agora?
          </h2>
        </Fade>
        <Fade delay={0.1} className="self-end text-gray max-w-xl">
          O país amplia base industrial, capacidade exportadora e conexões com América do Sul, América do Norte, Europa, Ásia e Oriente Médio. De mercado de fronteira para plataforma de produzir, investir e acessar outros mercados.
        </Fade>
      </div>
      <div className="mx-auto mt-16 max-w-[1440px] grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-border py-10">
        {site.stats.map((item) => (
          <Fade key={item.label}>
            <p className="display text-2xl md:text-4xl text-red">{item.value}</p>
            <p className="mt-2 text-sm text-gray">{item.label}</p>
          </Fade>
        ))}
      </div>
      <div className="mx-auto mt-10 max-w-[1440px] grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-gray">
        {site.marketFacts.map((item) => (
          <p key={item.label}><span className="block text-white text-lg display">{item.value}</span>{item.label}</p>
        ))}
      </div>
    </section>
  );
}
