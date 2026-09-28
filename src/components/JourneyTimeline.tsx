"use client";

import { days, site } from "@/data/site";
import { Fade, SectionLabel } from "./ui";

export function JourneyTimeline() {
  return (
    <section id="programa" className="px-5 py-24 md:px-8">
      <Fade className="mx-auto max-w-[1440px] mb-10">
        <SectionLabel>Rota da imersão</SectionLabel>
        <h2 className="text-[clamp(2.2rem,5vw,4.6rem)] font-semibold leading-[0.95] max-w-[14ch]">
          Do primeiro encontro à última conexão.
        </h2>
      </Fade>
      <div className="mx-auto flex max-w-[1440px] gap-4 overflow-x-auto pb-4 snap-x">
        {days.map((item) => (
          <article key={item.day} className="snap-start min-w-[280px] md:min-w-[340px] rounded-2xl border border-border bg-card p-6">
            <p className="text-red text-sm tracking-[0.16em] uppercase">{item.day}</p>
            <p className="text-gray text-xs mt-1 tracking-[0.14em] uppercase">{item.label}</p>
            <h3 className="display text-2xl mt-6">{item.title}</h3>
            <p className="text-gray mt-4 text-sm">{item.see}</p>
            <p className="text-xs text-gray-dark mt-6">{item.place}</p>
          </article>
        ))}
      </div>
      <div className="mx-auto max-w-[1440px] mt-14 grid md:grid-cols-2 gap-10 items-center">
        <svg viewBox="0 0 420 360" className="w-full max-w-md" aria-label="Mapa estilizado do Paraguai">
          <rect width="420" height="360" fill="#0D0D0F" />
          <path d="M80 40c90-20 210 10 270 70 40 42 50 110 20 170-40 70-140 90-220 70C70 330 30 250 36 180 40 120 50 60 80 40z" fill="#121214" stroke="rgba(255,255,255,0.2)" />
          <circle cx="190" cy="150" r="6" fill="#FF454A" />
          <text x="204" y="154" fill="#fff" fontSize="12">Assunção</text>
          <circle cx="280" cy="130" r="6" fill="#fff" />
          <text x="294" y="134" fill="#fff" fontSize="12">Ciudad del Este</text>
          <circle cx="300" cy="160" r="5" fill="#A1A1AA" />
          <text x="314" y="164" fill="#A1A1AA" fontSize="12">Alto Paraná</text>
        </svg>
        <p className="text-gray">
          {site.cities.join(" · ")}.
          <span className="block mt-3 text-sm text-gray-dark">{site.citiesNote}</span>
        </p>
      </div>
    </section>
  );
}
