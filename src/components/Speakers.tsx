"use client";

import { useState } from "react";
import Image from "next/image";
import { speakers } from "@/data/site";
import { Fade, SectionLabel } from "./ui";

export function Speakers() {
  const [i, setI] = useState(0);
  const current = speakers[i];
  return (
    <section className="px-5 py-24 md:px-8">
      <Fade className="mx-auto max-w-[1440px] mb-10">
        <SectionLabel>Especialistas</SectionLabel>
        <h2 className="text-[clamp(2.2rem,5vw,4.4rem)] font-semibold leading-[0.95] max-w-[14ch]">
          Quem conhece o mercado por dentro.
        </h2>
      </Fade>
      <div className="mx-auto max-w-[1440px] grid md:grid-cols-[1.2fr_0.8fr] gap-6">
        <article className="relative min-h-[420px] overflow-hidden rounded-3xl bg-card">
          <Image src={current.photo} alt="" fill className="object-cover grayscale" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="absolute bottom-0 p-8">
            <p className="text-gray text-sm">{String(i + 1).padStart(2, "0")} / {String(speakers.length).padStart(2, "0")}</p>
            <h3 className="display text-4xl mt-2">{current.name}</h3>
            <p className="text-gray mt-2">{current.role} · {current.company}</p>
            <p className="mt-3 text-sm">Especialidade: {current.focus}</p>
          </div>
        </article>
        <div className="flex md:flex-col gap-3 overflow-x-auto">
          {speakers.map((s, idx) => (
            <button key={s.focus} type="button" onClick={() => setI(idx)} className={`min-w-[200px] text-left rounded-2xl border p-4 ${idx === i ? "border-red" : "border-border"}`}>
              <p className="text-xs text-gray">{String(idx + 1).padStart(2, "0")}</p>
              <p className="display text-xl mt-1">{s.name}</p>
              <p className="text-sm text-gray">{s.focus}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
