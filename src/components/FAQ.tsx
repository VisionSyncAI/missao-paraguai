"use client";

import { useState } from "react";
import { faqs } from "@/data/site";
import { Fade, SectionLabel } from "./ui";

export function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="px-5 py-24 md:px-8">
      <Fade className="mx-auto max-w-[900px] mb-10">
        <SectionLabel>FAQ</SectionLabel>
        <h2 className="text-[clamp(2.2rem,5vw,4rem)] font-semibold">Perguntas frequentes</h2>
      </Fade>
      <div className="mx-auto max-w-[900px]">
        {faqs.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className="border-t border-border">
              <button
                type="button"
                className="w-full text-left py-5 flex items-start justify-between gap-6"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span className="display text-xl md:text-2xl">
                  <span className="text-gray mr-3">{String(i + 1).padStart(2, "0")}</span>
                  {item.q}
                </span>
                <span aria-hidden className="text-red text-2xl">{isOpen ? "−" : "+"}</span>
              </button>
              <div className={`overflow-hidden transition-all ${isOpen ? "max-h-64 pb-5 opacity-100" : "max-h-0 opacity-0"}`}>
                <p className="text-gray max-w-[62ch]">{item.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
