"use client";

import { useEffect, useState } from "react";
import { nav } from "@/data/site";

export function Navbar({ onCta }: { onCta: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/80 backdrop-blur-xl border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 md:px-8">
        <a href="#topo" className="leading-none">
          <span className="block text-[10px] tracking-[0.28em] text-gray">IMERSÃO</span>
          <span className="display text-lg tracking-[0.12em]">PARAGUAI</span>
        </a>
        <nav className="hidden lg:flex gap-6 text-[11px] tracking-[0.18em] uppercase text-gray">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-white relative after:absolute after:left-0 after:bottom-[-4px] after:h-px after:w-0 after:bg-red hover:after:w-full after:transition-all">
              {item.label}
            </a>
          ))}
        </nav>
        <button type="button" onClick={onCta} className="hidden md:inline-flex rounded-xl bg-red px-5 py-3 text-[11px] font-bold tracking-[0.12em] uppercase hover:-translate-y-0.5 transition">
          Garantir minha vaga ↗
        </button>
        <button type="button" className="lg:hidden w-10 h-10" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
          <span className="block h-px w-5 bg-white mx-auto" />
          <span className="block h-px w-5 bg-white mx-auto mt-1.5" />
        </button>
      </div>
      {open && (
        <div className="lg:hidden bg-black border-t border-border px-5 py-6 flex flex-col gap-4">
          {nav.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="text-xl display">
              {item.label}
            </a>
          ))}
          <button type="button" onClick={() => { setOpen(false); onCta(); }} className="rounded-xl bg-red px-5 py-3 text-[11px] font-bold tracking-[0.12em] uppercase">
            Garantir minha vaga ↗
          </button>
        </div>
      )}
    </header>
  );
}
