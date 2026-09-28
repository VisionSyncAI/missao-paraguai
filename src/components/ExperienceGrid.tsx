"use client";

import { experiences } from "@/data/site";
import { Fade, SectionLabel } from "./ui";

export function ExperienceGrid() {
  return (
    <section id="o-que-voce-vai-ver" className="px-5 py-24 md:px-8">
      <Fade className="mx-auto max-w-[1440px] mb-12">
        <SectionLabel>O que você vai ver</SectionLabel>
        <h2 className="text-[clamp(2.2rem,5vw,4.8rem)] font-semibold leading-[0.95] max-w-[14ch]">
          Você não vai assistir.
          <br />Você vai <span className="text-red">entrar.</span>
        </h2>
      </Fade>
      <div className="mx-auto grid max-w-[1440px] md:grid-cols-3 gap-px bg-border">
        {experiences.map((item) => (
          <article key={item.n} className="group bg-black p-8 md:p-10 min-h-[280px] hover:bg-card transition">
            <p className="text-gray text-sm">{item.n}</p>
            <h3 className="mt-8 display text-3xl">{item.title}</h3>
            <p className="mt-4 text-gray max-w-[36ch]">{item.text}</p>
            <span className="mt-8 block h-px w-0 bg-red transition-all duration-500 group-hover:w-full" />
          </article>
        ))}
      </div>
    </section>
  );
}
