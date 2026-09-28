"use client";

import { FormEvent, useState } from "react";
import { WHATSAPP_NUMBER } from "@/data/site";

export function LeadForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [ok, setOk] = useState(false);
  if (!open) return null;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const message = [
      "Pré-seleção — Imersão Paraguai",
      `Nome: ${data.nome} ${data.sobrenome}`,
      `E-mail: ${data.email}`,
      `WhatsApp: ${data.whatsapp}`,
      `Empresa: ${data.empresa}`,
      `Cargo: ${data.cargo}`,
      `Segmento: ${data.segmento}`,
      `Cidade: ${data.cidade}`,
      `Participantes: ${data.participantes}`,
      `Interesse: ${data.interesse}`,
      `Modalidade: ${data.modalidade}`,
    ].join("\n");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
    setOk(true);
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-labelledby="form-title">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-black-soft border border-border p-6 md:p-10">
        <div className="flex justify-between gap-4">
          <h2 id="form-title" className="display text-3xl">Quero receber as informações</h2>
          <button type="button" onClick={onClose} className="text-gray">Fechar</button>
        </div>
        {ok ? (
          <p className="mt-8 text-gray">Pré-seleção enviada. Vamos abrir o WhatsApp com os dados da sua empresa.</p>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 grid gap-3 md:grid-cols-2">
            <label className="text-[10px] tracking-[0.16em] uppercase text-gray">Nome<input required name="nome" className="mt-1 w-full rounded-lg bg-card border border-border p-3 text-white" /></label>
            <label className="text-[10px] tracking-[0.16em] uppercase text-gray">Sobrenome<input required name="sobrenome" className="mt-1 w-full rounded-lg bg-card border border-border p-3 text-white" /></label>
            <label className="text-[10px] tracking-[0.16em] uppercase text-gray">E-mail<input required type="email" name="email" className="mt-1 w-full rounded-lg bg-card border border-border p-3 text-white" /></label>
            <label className="text-[10px] tracking-[0.16em] uppercase text-gray">WhatsApp<input required name="whatsapp" className="mt-1 w-full rounded-lg bg-card border border-border p-3 text-white" /></label>
            <label className="text-[10px] tracking-[0.16em] uppercase text-gray">Empresa<input required name="empresa" className="mt-1 w-full rounded-lg bg-card border border-border p-3 text-white" /></label>
            <label className="text-[10px] tracking-[0.16em] uppercase text-gray">Cargo<input required name="cargo" className="mt-1 w-full rounded-lg bg-card border border-border p-3 text-white" /></label>
            <label className="text-[10px] tracking-[0.16em] uppercase text-gray">Segmento<input required name="segmento" className="mt-1 w-full rounded-lg bg-card border border-border p-3 text-white" /></label>
            <label className="text-[10px] tracking-[0.16em] uppercase text-gray">Cidade<input required name="cidade" className="mt-1 w-full rounded-lg bg-card border border-border p-3 text-white" /></label>
            <label className="text-[10px] tracking-[0.16em] uppercase text-gray">Nº de participantes<input required name="participantes" className="mt-1 w-full rounded-lg bg-card border border-border p-3 text-white" /></label>
            <label className="text-[10px] tracking-[0.16em] uppercase text-gray">Interesse<input required name="interesse" className="mt-1 w-full rounded-lg bg-card border border-border p-3 text-white" /></label>
            <label className="md:col-span-2 text-[10px] tracking-[0.16em] uppercase text-gray">
              Modalidade
              <select required name="modalidade" className="mt-1 w-full rounded-lg bg-card border border-border p-3 text-white">
                <option value="">Selecione</option>
                <option>Participação individual</option>
                <option>Grupo corporativo</option>
                <option>Quero saber mais</option>
              </select>
            </label>
            <button type="submit" className="md:col-span-2 rounded-xl bg-red px-7 py-4 text-[12px] font-bold tracking-[0.12em] uppercase">
              Quero receber as informações ↗
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
