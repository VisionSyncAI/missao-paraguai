"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const floats = [
  { src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=70", label: "Comércio", className: "top-[22%] right-[8%] w-28 md:w-40" },
  { src: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=400&q=70", label: "Logística", className: "top-[48%] right-[18%] w-24 md:w-36" },
  { src: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=70", label: "Negócios", className: "bottom-[22%] right-[6%] w-28 md:w-36" },
  { src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=70", label: "Tecnologia", className: "top-[30%] left-[6%] w-24 md:w-32 hidden md:block" },
];

export function Hero({ onCta }: { onCta: () => void }) {
  return (
    <section id="topo" className="relative min-h-svh overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=2400&q=70"
        alt="Skyline urbano à noite"
        fill
        priority
        className="object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black" />
      {floats.map((item) => (
        <motion.figure
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className={`absolute z-10 overflow-hidden rounded-xl border border-border ${item.className}`}
        >
          <Image src={item.src} alt={item.label} width={320} height={220} className="h-full w-full object-cover" />
          <figcaption className="absolute bottom-1.5 left-2 text-[9px] tracking-[0.2em] uppercase">{item.label}</figcaption>
        </motion.figure>
      ))}
      <div className="relative z-20 mx-auto flex min-h-svh max-w-[1440px] flex-col justify-center md:justify-end px-5 pb-32 pt-28 md:px-8">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] tracking-[0.32em] uppercase text-gray">
          Paraguai 2026 · Imersão executiva
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-4 max-w-[16ch] text-[clamp(2.8rem,8vw,6.8rem)] font-semibold leading-[0.9]"
        >
          O Paraguai <span className="text-red">mudou.</span>
          <br />Você já percebeu?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 max-w-xl text-gray"
        >
          Uma imersão executiva para entender negócios, comércio, logística, tecnologia e oportunidades em um dos mercados mais estratégicos da América do Sul.
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={onCta} className="rounded-xl bg-red px-7 py-4 text-[12px] font-bold tracking-[0.12em] uppercase hover:-translate-y-0.5 transition">
            Quero viver a imersão ↗
          </button>
          <a href="#programa" className="rounded-xl border border-border px-7 py-4 text-[12px] font-bold tracking-[0.12em] uppercase hover:border-white/40">
            Ver o programa ↓
          </a>
        </motion.div>
      </div>
    </section>
  );
}
