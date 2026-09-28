"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { COMPANY_TYPES, COMPANION_TYPES, EMPLOYEE_BANDS, OBJECTIVES } from "@/modules/leads/status";
import { ConsultantScheduler } from "@/components/commercial/ConsultantScheduler";

type Slot = { start: string; consultantId: string; consultantName: string };

const STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

function fieldClass() {
  return "mt-1 w-full rounded-lg bg-[#080808] border border-white/15 p-3 text-white";
}

export function InterestForm() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [alone, setAlone] = useState(true);
  const [hasCompany, setHasCompany] = useState(true);
  const [dietary, setDietary] = useState(false);
  const [calUid, setCalUid] = useState("");
  const [scheduler, setScheduler] = useState<{ provider: string; embedOrigin: string | null; calLink: string | null } | null>(null);

  const onBooked = useCallback((uid: string) => setCalUid(uid), []);

  useEffect(() => {
    Promise.all([
      fetch("/api/scheduling/config").then((r) => r.json()),
      fetch("/api/meetings/availability").then((r) => r.json()),
    ])
      .then(([config, availability]) => {
        setScheduler(config);
        setSlots(availability.slots || []);
        if (availability.error && config.provider === "none") {
          setError("Agenda do consultor indisponível. Configure o motor de scheduling.");
        }
      })
      .catch(() => setError("Não foi possível carregar a agenda."));
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const slot of slots) {
      const day = new Date(slot.start).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "short" });
      map.set(day, [...(map.get(day) || []), slot]);
    }
    return [...map.entries()];
  }, [slots]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    const objectives = data.getAll("objectives").map(String);
    const companions = alone
      ? []
      : [...form.querySelectorAll("[data-companion]")].map((row) => {
          const el = row as HTMLElement;
          return {
            fullName: (el.querySelector('[name="companionName"]') as HTMLInputElement)?.value,
            relationType: (el.querySelector('[name="companionType"]') as HTMLSelectElement)?.value,
            email: (el.querySelector('[name="companionEmail"]') as HTMLInputElement)?.value,
            whatsapp: (el.querySelector('[name="companionWhatsapp"]') as HTMLInputElement)?.value,
          };
        });
    const payload = {
      fullName: data.get("fullName"),
      email: data.get("email"),
      whatsapp: data.get("whatsapp"),
      altPhone: data.get("altPhone"),
      cpf: data.get("cpf"),
      city: data.get("city"),
      state: data.get("state"),
      country: "Brasil",
      hasCompany,
      legalName: data.get("legalName"),
      tradeName: data.get("tradeName"),
      cnpj: data.get("cnpj"),
      companyType: data.get("companyType"),
      segment: data.get("segment"),
      jobTitle: data.get("jobTitle"),
      employeeBand: data.get("employeeBand"),
      companyCity: data.get("companyCity"),
      companyState: data.get("companyState"),
      website: data.get("website"),
      social: data.get("social"),
      objectives,
      objectiveNotes: data.get("objectiveNotes"),
      beenToParaguay: data.get("beenToParaguay") === "true",
      hasBusinessParaguay: data.get("hasBusinessParaguay") === "true",
      hasPartnersParaguay: data.get("hasPartnersParaguay") === "true",
      wantsOpenOperation: data.get("wantsOpenOperation") === "true",
      hasInternationalOps: data.get("hasInternationalOps") === "true",
      interestInvest: data.get("interestInvest") === "true",
      interestNetworking: data.get("interestNetworking") === "true",
      interestB2B: data.get("interestB2B") === "true",
      interestIndustry: data.get("interestIndustry") === "true",
      participateAlone: alone,
      companions,
      dietaryRestricted: dietary,
      dietaryNotes: data.get("dietaryNotes"),
      specialNeeds: data.get("specialNeeds"),
      scheduledAt: data.get("scheduledAt"),
      consultantId: data.get("consultantId"),
      calBookingUid: calUid,
      privacyAccepted: data.get("privacyAccepted") === "on",
      contactAccepted: data.get("contactAccepted") === "on",
      source: "interesse",
    };
    const slot = slots.find((s) => s.start === payload.scheduledAt);
    if (slot) payload.consultantId = slot.consultantId;
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error || "Não foi possível enviar.");
      return;
    }
    window.location.href = `/interesse/confirmacao?t=${encodeURIComponent(json.token)}`;
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8">
      <section className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 md:p-8">
        <p className="text-[11px] tracking-[0.2em] uppercase text-red">01 · Dados pessoais</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-[11px] tracking-[0.14em] uppercase text-gray">Nome completo *<input required name="fullName" className={fieldClass()} autoComplete="name" /></label>
          <label className="text-[11px] tracking-[0.14em] uppercase text-gray">E-mail *<input required type="email" name="email" className={fieldClass()} autoComplete="email" /></label>
          <label className="text-[11px] tracking-[0.14em] uppercase text-gray">WhatsApp *<input required name="whatsapp" className={fieldClass()} autoComplete="tel" /></label>
          <label className="text-[11px] tracking-[0.14em] uppercase text-gray">Telefone alternativo<input name="altPhone" className={fieldClass()} /></label>
          <label className="text-[11px] tracking-[0.14em] uppercase text-gray">CPF (opcional nesta etapa)<input name="cpf" className={fieldClass()} /></label>
          <label className="text-[11px] tracking-[0.14em] uppercase text-gray">Cidade *<input required name="city" className={fieldClass()} /></label>
          <label className="text-[11px] tracking-[0.14em] uppercase text-gray">Estado *<select required name="state" className={fieldClass()}>{STATES.map((s) => <option key={s}>{s}</option>)}</select></label>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 md:p-8">
        <p className="text-[11px] tracking-[0.2em] uppercase text-red">02 · Empresa</p>
        <label className="mt-4 flex items-center gap-2 text-sm text-gray">
          <input type="checkbox" checked={hasCompany} onChange={(e) => setHasCompany(e.target.checked)} /> Possui empresa
        </label>
        {hasCompany && (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-[11px] tracking-[0.14em] uppercase text-gray">Razão social *<input required={hasCompany} name="legalName" className={fieldClass()} /></label>
            <label className="text-[11px] tracking-[0.14em] uppercase text-gray">Nome fantasia<input name="tradeName" className={fieldClass()} /></label>
            <label className="text-[11px] tracking-[0.14em] uppercase text-gray">CNPJ<input name="cnpj" className={fieldClass()} /></label>
            <label className="text-[11px] tracking-[0.14em] uppercase text-gray">Tipo<select name="companyType" className={fieldClass()}><option value="">Selecione</option>{COMPANY_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
            <label className="text-[11px] tracking-[0.14em] uppercase text-gray">Segmento<input name="segment" className={fieldClass()} /></label>
            <label className="text-[11px] tracking-[0.14em] uppercase text-gray">Cargo<input name="jobTitle" className={fieldClass()} /></label>
            <label className="text-[11px] tracking-[0.14em] uppercase text-gray">Colaboradores<select name="employeeBand" className={fieldClass()}><option value="">Selecione</option>{EMPLOYEE_BANDS.map((t) => <option key={t}>{t}</option>)}</select></label>
            <label className="text-[11px] tracking-[0.14em] uppercase text-gray">Cidade da empresa<input name="companyCity" className={fieldClass()} /></label>
            <label className="text-[11px] tracking-[0.14em] uppercase text-gray">UF da empresa<input name="companyState" className={fieldClass()} /></label>
            <label className="text-[11px] tracking-[0.14em] uppercase text-gray">Site<input name="website" className={fieldClass()} /></label>
            <label className="text-[11px] tracking-[0.14em] uppercase text-gray">Instagram / LinkedIn<input name="social" className={fieldClass()} /></label>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 md:p-8">
        <p className="text-[11px] tracking-[0.2em] uppercase text-red">03 · Objetivo da missão</p>
        <div className="mt-5 grid gap-2 md:grid-cols-2">
          {OBJECTIVES.map((o) => (
            <label key={o} className="flex gap-2 text-sm text-gray">
              <input type="checkbox" name="objectives" value={o} /> {o}
            </label>
          ))}
        </div>
        <label className="mt-4 block text-[11px] tracking-[0.14em] uppercase text-gray">Conte-nos um pouco mais
          <textarea name="objectiveNotes" className={fieldClass()} rows={3} />
        </label>
        <div className="mt-6 grid gap-3 md:grid-cols-2 text-sm text-gray">
          {[
            ["beenToParaguay", "Já esteve no Paraguai?"],
            ["hasBusinessParaguay", "Já possui negócios no Paraguai?"],
            ["hasPartnersParaguay", "Já possui parceiros no Paraguai?"],
            ["wantsOpenOperation", "Interesse em abrir operação?"],
            ["hasInternationalOps", "Já operou internacionalmente?"],
            ["interestInvest", "Interesse em investir?"],
            ["interestNetworking", "Interesse em networking?"],
            ["interestB2B", "Interesse em reuniões B2B?"],
            ["interestIndustry", "Interesse em visitas industriais?"],
          ].map(([name, label]) => (
            <label key={name} className="flex items-center justify-between gap-3 border-b border-white/10 py-2">
              <span>{label}</span>
              <select name={name} className="bg-black border border-white/15 rounded-md p-2">
                <option value="false">Não</option>
                <option value="true">Sim</option>
              </select>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 md:p-8">
        <p className="text-[11px] tracking-[0.2em] uppercase text-red">04 · Acompanhantes</p>
        <p className="mt-2 text-sm text-gray">Nesta etapa registramos apenas a intenção. Dados completos de alimentação e documentos entram depois do fechamento.</p>
        <label className="mt-4 flex gap-2 text-sm"><input type="radio" checked={alone} onChange={() => setAlone(true)} /> Participarei sozinho(a)</label>
        <label className="flex gap-2 text-sm"><input type="radio" checked={!alone} onChange={() => setAlone(false)} /> Levarei acompanhante</label>
        {!alone && (
          <div className="mt-4 grid gap-4" data-companion>
            <label className="text-[11px] tracking-[0.14em] uppercase text-gray">Nome do acompanhante<input name="companionName" className={fieldClass()} /></label>
            <label className="text-[11px] tracking-[0.14em] uppercase text-gray">Relação<select name="companionType" className={fieldClass()}>{COMPANION_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
            <label className="text-[11px] tracking-[0.14em] uppercase text-gray">E-mail<input name="companionEmail" className={fieldClass()} /></label>
            <label className="text-[11px] tracking-[0.14em] uppercase text-gray">WhatsApp<input name="companionWhatsapp" className={fieldClass()} /></label>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 md:p-8">
        <p className="text-[11px] tracking-[0.2em] uppercase text-red">05 · Alimentação (opcional)</p>
        <p className="mt-2 text-sm text-gray">Uso exclusivo da operação da missão, com acesso restrito. Não envie alergias por WhatsApp.</p>
        <label className="mt-4 flex gap-2 text-sm"><input type="checkbox" checked={dietary} onChange={(e) => setDietary(e.target.checked)} /> Possuo restrição alimentar</label>
        {dietary && <textarea name="dietaryNotes" className={fieldClass()} placeholder="Descreva alimentos a evitar" />}
        <label className="mt-4 block text-[11px] tracking-[0.14em] uppercase text-gray">Outras observações operacionais
          <textarea name="specialNeeds" className={fieldClass()} rows={2} />
        </label>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 md:p-8">
        <p className="text-[11px] tracking-[0.2em] uppercase text-red">06 · Reunião com consultor</p>
        <p className="mt-2 text-sm text-gray">
          Escolha um horário. A disponibilidade e os conflitos são controlados pelo motor de agenda da operação, sem expor um calendário separado.
        </p>
        {scheduler?.provider === "cal" && scheduler.embedOrigin && scheduler.calLink ? (
          <div className="mt-5">
            <ConsultantScheduler embedOrigin={scheduler.embedOrigin} calLink={scheduler.calLink} onBooked={onBooked} />
            {calUid ? <p className="mt-3 text-sm text-white">Horário confirmado. Conclua o envio do formulário.</p> : <p className="mt-3 text-sm text-gray">Selecione um horário acima para continuar.</p>}
          </div>
        ) : (
          <div className="mt-5 grid gap-6">
            <input type="hidden" name="consultantId" />
            {grouped.length === 0 && <p className="text-gray">Carregando horários locais de desenvolvimento…</p>}
            {grouped.map(([day, daySlots]) => (
              <div key={day}>
                <p className="mb-2 text-sm capitalize text-white">{day}</p>
                <div className="flex flex-wrap gap-2">
                  {daySlots.map((slot) => (
                    <label key={slot.start} className="cursor-pointer">
                      <input required={!calUid} type="radio" name="scheduledAt" value={slot.start} className="peer sr-only" />
                      <span className="inline-block rounded-lg border border-white/15 px-3 py-2 text-sm peer-checked:border-red peer-checked:bg-red">
                        {new Date(slot.start).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 md:p-8">
        <label className="flex gap-2 text-sm text-gray"><input required type="checkbox" name="privacyAccepted" /> Li e aceito a política de privacidade da Imersão Paraguai.</label>
        <label className="mt-3 flex gap-2 text-sm text-gray"><input required type="checkbox" name="contactAccepted" /> Autorizo contato comercial por e-mail, telefone e WhatsApp.</label>
        {error && <p className="mt-4 text-red">{error}</p>}
        <button disabled={loading || (scheduler?.provider === "cal" && !calUid)} className="mt-6 w-full rounded-xl bg-red px-6 py-4 text-xs font-bold tracking-[0.14em] uppercase disabled:opacity-50">
          {loading ? "Enviando…" : "Enviar interesse e confirmar conversa"}
        </button>
      </section>
    </form>
  );
}
