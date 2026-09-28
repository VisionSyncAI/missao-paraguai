"use client";

import Image from "next/image";
import { gallery } from "@/data/site";
import { Fade, SectionLabel } from "./ui";

export function FieldExperience() {
  return (
    <section className="px-5 py-24 md:px-8">
      <Fade className="mx-auto max-w-[1440px] mb-10">
        <SectionLabel>Experiência em campo</SectionLabel>
        <h2 className="text-[clamp(2.2rem,5vw,4.6rem)] font-semibold leading-[0.95] max-w-[12ch]">
          Você vê. Pergunta. Conecta. Entende.
        </h2>
      </Fade>
      <div className="mx-auto max-w-[1440px] columns-1 md:columns-3 gap-3">
        {gallery.map((item) => (
          <figure key={item.tag} className="relative mb-3 break-inside-avoid overflow-hidden rounded-2xl">
            <Image src={item.src} alt={item.alt} width={800} height={600} className="w-full object-cover" />
            <figcaption className="absolute bottom-3 left-3 text-[10px] tracking-[0.2em] uppercase bg-black/50 px-2 py-1 rounded">{item.tag}</figcaption>
          </figure>
        ))}
      </div>
      <p className="mx-auto max-w-[1440px] mt-4 text-xs text-gray-dark">Imagens ilustrativas até a fotografia oficial da imersão.</p>
    </section>
  );
}
