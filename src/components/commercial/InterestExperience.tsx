"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ConsultantScheduler } from "@/components/commercial/ConsultantScheduler";
import { SlotPicker } from "@/components/commercial/SlotPicker";
import { trackFunnel } from "@/components/commercial/trackFunnel";
import { isLiveMeetingLink } from "@/lib/meetingLink";
import { formatSaoPaulo } from "@/lib/timezone";
import {
  COMPANY_SIZE_BANDS,
  JOB_TITLE_OPTIONS,
  PARAGUAY_INTERESTS,
  PARAGUAY_RELATIONSHIPS,
  PARTICIPATION_INTENTS,
} from "@/modules/leads/status";
import {
  INTEREST_STEPS,
  type InterestDraft,
  emptyDraft,
  parseUtm,
  validateStep,
} from "@/modules/interest/flow";

type Phase = "intro" | "form" | "schedule" | "done";

const TITLES: Record<(typeof INTEREST_STEPS)[number], string> = {
  name: "Como podemos te chamar?",
  contact: "Como podemos falar com você?",
  role: "Qual é o seu cargo atual?",
  companySize: "Qual é o porte aproximado da sua empresa?",
  interests: "Qual é o seu principal interesse no Paraguai?",
  objective: "O que você espera encontrar nessa imersão?",
  relationship: "Você já possui alguma operação ou relacionamento com o Paraguai?",
  intent: "Qual é o seu nível de interesse em participar?",
  consent: "Podemos seguir com o contato?",
};

export function InterestExperience() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<InterestDraft>(emptyDraft);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [token, setToken] = useState("");
  const [calUid, setCalUid] = useState("");
  const [meeting, setMeeting] = useState<{
    scheduledAt: string;
    meetingUrl: string | null;
    consultantName: string;
    email: string;
  } | null>(null);
  const [scheduler, setScheduler] = useState<{ provider: string; embedOrigin: string | null; calLink: string | null } | null>(null);
  const [slots, setSlots] = useState<{ start: string; consultantId: string; consultantName: string }[]>([]);
  const [localSlot, setLocalSlot] = useState("");
  const submitted = useRef(false);
  const bookingSent = useRef(false);
  const utm = useMemo(() => (typeof window === "undefined" ? {} : parseUtm(window.location.search)), []);
  const step = INTEREST_STEPS[stepIndex];

  useEffect(() => {
    Promise.all([
      fetch("/api/scheduling/config").then((r) => r.json()),
      fetch("/api/meetings/availability").then((r) => r.json()),
    ])
      .then(([config, availability]) => {
        setScheduler(config);
        setSlots(availability.slots || []);
      })
      .catch(() => undefined);
  }, []);

  const onBooked = useCallback((uid: string) => {
    setCalUid(uid);
    trackFunnel("CAL_BOOKING_STARTED", { utm });
  }, [utm]);

  useEffect(() => {
    if (phase !== "form") return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        void goNext();
      }
      if ((event.key === "Escape" || (event.key === "Backspace" && isBackspaceBack())) && stepIndex > 0) {
        const tag = document.activeElement?.tagName;
        if (event.key === "Escape" || (tag !== "INPUT" && tag !== "TEXTAREA")) {
          event.preventDefault();
          setStepIndex((i) => Math.max(0, i - 1));
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function isBackspaceBack() {
    const el = document.activeElement as HTMLInputElement | null;
    return !el || el.tagName !== "INPUT" && el.tagName !== "TEXTAREA" || !el.value;
  }

  async function goNext() {
    const invalid = validateStep(step, draft);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError("");
    trackFunnel("QUESTION_COMPLETED", { step, utm });
    if (stepIndex < INTEREST_STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
      return;
    }
    await submitLead();
  }

  async function submitLead() {
    if (submitted.current || saving) return;
    submitted.current = true;
    setSaving(true);
    setError("");
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: draft.fullName,
        email: draft.email,
        whatsapp: draft.whatsapp,
        jobTitle: draft.jobTitle,
        jobTitleOther: draft.jobTitleOther,
        companySize: draft.companySize,
        interests: draft.interests,
        objective: draft.objective,
        relationship: draft.relationship,
        intent: draft.intent,
        consent: draft.consent,
        source: "interesse",
        utm,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      submitted.current = false;
      setError(json.error || "Não conseguimos salvar seus dados agora. Verifique sua conexão e tente novamente.");
      return;
    }
    if (typeof json.token === "string" && json.token) setToken(json.token);
    trackFunnel("INTEREST_SUBMITTED", { utm });
    trackFunnel("CAL_OPENED", { utm });
    setPhase("schedule");
  }

  async function confirmBooking(uid?: string, scheduledAt?: string, consultantId?: string) {
    if (saving || bookingSent.current) return;
    bookingSent.current = true;
    setSaving(true);
    setError("");
    const res = await fetch("/api/leads/meeting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token || undefined, calBookingUid: uid || calUid, scheduledAt, consultantId }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      bookingSent.current = false;
      setError(json.error || "Não foi possível confirmar a reunião.");
      return;
    }
    setMeeting({
      scheduledAt: json.meeting.scheduledAt,
      meetingUrl: json.meeting.meetingUrl ?? null,
      consultantName: json.meeting.consultantName,
      email: json.meeting.email || "",
    });
    trackFunnel("CAL_BOOKING_CONFIRMED", { utm });
    trackFunnel("INTEREST_COMPLETED", { utm });
    setPhase("done");
  }

  useEffect(() => {
    if (calUid && phase === "schedule") {
      void confirmBooking(calUid);
    }
  }, [calUid, phase]);

  if (phase === "intro") {
    return (
      <section className="flex min-h-[80dvh] flex-col justify-center">
        <p className="text-[11px] tracking-[0.28em] uppercase text-red">Imersão Paraguai</p>
        <h1 className="mt-6 font-display text-5xl leading-[0.95] md:text-7xl">Imersão Paraguai</h1>
        <p className="mt-6 max-w-xl text-lg text-gray">
          Uma experiência executiva de 5 dias para empresários que querem conhecer o mercado paraguaio, gerar conexões e identificar oportunidades de negócios.
        </p>
        <button
          className="mt-10 w-fit rounded-full bg-red px-8 py-4 text-xs font-bold uppercase tracking-[0.16em]"
          onClick={() => {
            trackFunnel("INTEREST_STARTED", { utm, cta: "COMECAR_PRE_INSCRICAO" });
            setPhase("form");
          }}
        >
          Começar minha pré-inscrição →
        </button>
      </section>
    );
  }

  if (phase === "done") {
    const live = meeting ? isLiveMeetingLink(meeting.meetingUrl) : false;
    return (
      <section className="flex min-h-[80dvh] flex-col justify-center">
        <p className="text-[11px] tracking-[0.28em] uppercase text-red">✓ Horário confirmado</p>
        <h1 className="mt-6 font-display text-5xl md:text-6xl">
          {meeting ? "Horário confirmado." : "Seu perfil foi recebido."}
        </h1>
        <p className="mt-4 max-w-xl text-gray">
          {meeting
            ? "Sua conversa com a equipe da Imersão Paraguai está agendada."
            : "Agora vamos entender seu momento, seus objetivos e como podemos conectar sua empresa às oportunidades certas no Paraguai."}
        </p>
        {meeting ? (
          <div className="mt-10 max-w-xl space-y-8">
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-red">Data e horário</p>
              <p className="mt-2 text-xl">{formatSaoPaulo(new Date(meeting.scheduledAt))}</p>
            </div>
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-red">Consultor</p>
              <p className="mt-2 text-xl">{meeting.consultantName}</p>
            </div>
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-red">Próximo passo</p>
              <p className="mt-2 text-gray">
                {live
                  ? "Seu horário está confirmado. Você também pode entrar diretamente pela sala da reunião."
                  : "Seu horário está confirmado. O link da reunião será enviado para o e-mail informado assim que estiver disponível."}
              </p>
              {meeting.email ? (
                <p className="mt-3 text-white">{meeting.email}</p>
              ) : (
                <p className="mt-3 text-gray">O link da reunião será enviado para o e-mail informado no cadastro.</p>
              )}
              <p className="mt-2 text-sm text-gray">Verifique também sua caixa de spam.</p>
            </div>
            {live && meeting.meetingUrl ? (
              <a
                className="inline-flex rounded-full border border-white/20 px-8 py-4 text-xs font-bold uppercase tracking-[0.16em]"
                href={meeting.meetingUrl}
                target="_blank"
                rel="noreferrer"
              >
                Abrir sala da reunião
              </a>
            ) : null}
          </div>
        ) : (
          <p className="mt-8 text-gray">Seu interesse foi registrado.</p>
        )}
      </section>
    );
  }

  if (phase === "schedule") {
    return (
      <section className="min-h-[80dvh] py-8">
        <p className="text-[11px] tracking-[0.28em] uppercase text-red">Conversa estratégica</p>
        <h1 className="mt-6 font-display text-4xl md:text-6xl">Vamos conversar sobre o seu cenário?</h1>
        <p className="mt-4 max-w-xl text-gray">Escolha um dia e horário até 15 de novembro de 2026 para falar com um de nossos consultores.</p>
        <p className="mt-3 text-sm text-white">Seu interesse foi registrado.</p>
        {scheduler?.provider === "cal" && scheduler.embedOrigin && scheduler.calLink ? (
          <div className="mt-8">
            <ConsultantScheduler embedOrigin={scheduler.embedOrigin} calLink={scheduler.calLink} onBooked={onBooked} />
            {saving && <p className="mt-4 text-sm text-gray">Confirmando horário…</p>}
          </div>
        ) : scheduler?.provider === "local" ? (
          <div className="mt-8">
            <SlotPicker
              slots={slots}
              selected={localSlot}
              onSelect={(slot) => {
                setLocalSlot(slot.start);
                void confirmBooking(undefined, slot.start, slot.consultantId);
              }}
            />
          </div>
        ) : (
          <p className="mt-8 max-w-xl text-gray">
            Não há horários livres neste momento. Seu interesse já foi registrado — a equipe entra em contato pelo e-mail informado.
          </p>
        )}
        <p className="mt-8 text-sm text-gray">Agende sua conversa estratégica para continuar.</p>
        {error && <p className="mt-4 text-red">{error}</p>}
      </section>
    );
  }

  return (
    <section className="flex min-h-[80dvh] flex-col justify-center">
      <p className="text-[11px] tracking-[0.2em] uppercase text-gray">{stepIndex + 1} de {INTEREST_STEPS.length}</p>
      <div className="mt-3 h-px w-full bg-white/10">
        <div className="h-px bg-red" style={{ width: `${((stepIndex + 1) / INTEREST_STEPS.length) * 100}%` }} />
      </div>
      <h1 className="mt-10 font-display text-4xl leading-tight md:text-6xl">{TITLES[step]}</h1>
      <div className="mt-10 max-w-xl">
        {step === "name" && (
          <label className="block text-sm text-gray">
            Nome completo
            <input
              autoFocus
              aria-describedby="interest-error"
              className="mt-3 w-full border-b border-white/20 bg-transparent py-3 text-2xl outline-none"
              value={draft.fullName}
              onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
            />
          </label>
        )}
        {step === "contact" && (
          <div className="grid gap-6">
            <label className="block text-sm text-gray">
              WhatsApp
              <input
                autoFocus
                className="mt-3 w-full border-b border-white/20 bg-transparent py-3 text-2xl outline-none"
                value={draft.whatsapp}
                onChange={(e) => setDraft({ ...draft, whatsapp: e.target.value })}
                autoComplete="tel"
              />
            </label>
            <label className="block text-sm text-gray">
              E-mail
              <input
                className="mt-3 w-full border-b border-white/20 bg-transparent py-3 text-2xl outline-none"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                autoComplete="email"
              />
            </label>
          </div>
        )}
        {step === "role" && (
          <div className="grid gap-2">
            {JOB_TITLE_OPTIONS.map((option) => (
              <button
                key={option}
                className={`rounded-xl border px-4 py-3 text-left ${draft.jobTitle === option ? "border-red" : "border-white/15"}`}
                onClick={() => {
                  setDraft({ ...draft, jobTitle: option });
                  if (option !== "Outro") {
                    setTimeout(() => {
                      setDraft((current) => ({ ...current, jobTitle: option }));
                      setStepIndex((i) => Math.min(i + 1, INTEREST_STEPS.length - 1));
                      trackFunnel("QUESTION_COMPLETED", { step: "role", utm });
                    }, 80);
                  }
                }}
              >
                {option}
              </button>
            ))}
            {draft.jobTitle === "Outro" && (
              <input
                className="mt-3 w-full border-b border-white/20 bg-transparent py-3 text-xl outline-none"
                placeholder="Qual é o cargo?"
                value={draft.jobTitleOther}
                onChange={(e) => setDraft({ ...draft, jobTitleOther: e.target.value })}
              />
            )}
          </div>
        )}
        {step === "companySize" && (
          <div className="grid gap-2">
            {COMPANY_SIZE_BANDS.map((option) => (
              <button
                key={option}
                className={`rounded-xl border px-4 py-3 text-left ${draft.companySize === option ? "border-red" : "border-white/15"}`}
                onClick={() => {
                  setDraft({ ...draft, companySize: option });
                  trackFunnel("QUESTION_COMPLETED", { step: "companySize", utm });
                  setStepIndex((i) => i + 1);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        )}
        {step === "interests" && (
          <div className="grid gap-2">
            {PARAGUAY_INTERESTS.map((option) => {
              const on = draft.interests.includes(option);
              return (
                <button
                  key={option}
                  className={`rounded-xl border px-4 py-3 text-left ${on ? "border-red" : "border-white/15"}`}
                  onClick={() => {
                    setDraft({
                      ...draft,
                      interests: on ? draft.interests.filter((item) => item !== option) : [...draft.interests, option],
                    });
                  }}
                >
                  {option}
                </button>
              );
            })}
          </div>
        )}
        {step === "objective" && (
          <label className="block text-sm text-gray">
            Conte brevemente
            <textarea
              className="mt-3 w-full border border-white/15 bg-transparent p-4 text-lg outline-none"
              rows={5}
              placeholder="Conte brevemente o que você gostaria de encontrar, conhecer ou desenvolver no Paraguai."
              value={draft.objective}
              onChange={(e) => setDraft({ ...draft, objective: e.target.value })}
            />
          </label>
        )}
        {step === "relationship" && (
          <div className="grid gap-2">
            {PARAGUAY_RELATIONSHIPS.map((option) => (
              <button
                key={option}
                className={`rounded-xl border px-4 py-3 text-left ${draft.relationship === option ? "border-red" : "border-white/15"}`}
                onClick={() => {
                  setDraft({ ...draft, relationship: option });
                  trackFunnel("QUESTION_COMPLETED", { step: "relationship", utm });
                  setStepIndex((i) => i + 1);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        )}
        {step === "intent" && (
          <div className="grid gap-2">
            {PARTICIPATION_INTENTS.map((option) => (
              <button
                key={option}
                className={`rounded-xl border px-4 py-3 text-left ${draft.intent === option ? "border-red" : "border-white/15"}`}
                onClick={() => {
                  setDraft({ ...draft, intent: option });
                  trackFunnel("QUESTION_COMPLETED", { step: "intent", utm });
                  setStepIndex((i) => i + 1);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        )}
        {step === "consent" && (
          <label className="flex items-start gap-3 text-sm text-gray">
            <input
              type="checkbox"
              className="mt-1"
              checked={draft.consent}
              onChange={(e) => setDraft({ ...draft, consent: e.target.checked })}
            />
            <span>
              Concordo em receber informações sobre a Imersão Paraguai e ser contatado pela equipe responsável.
              Política de Privacidade e Termos serão publicados após aprovação jurídica.
            </span>
          </label>
        )}
      </div>
      {error && <p id="interest-error" className="mt-6 text-red" role="alert">{error}</p>}
      <div className="mt-10 flex flex-wrap gap-3">
        {stepIndex > 0 && (
          <button className="rounded-full border border-white/20 px-6 py-3 text-xs uppercase tracking-widest" onClick={() => setStepIndex(stepIndex - 1)}>
            Voltar
          </button>
        )}
        <button
          disabled={saving}
          className="rounded-full bg-red px-8 py-3 text-xs font-bold uppercase tracking-widest disabled:opacity-50"
          onClick={() => void goNext()}
        >
          {saving ? "Salvando…" : step === "consent" ? "Enviar pré-inscrição" : "Continuar"}
        </button>
      </div>
    </section>
  );
}
