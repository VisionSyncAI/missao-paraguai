"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ConsultantScheduler } from "@/components/commercial/ConsultantScheduler";
import { SlotPicker } from "@/components/commercial/SlotPicker";
import { trackFunnel } from "@/components/commercial/trackFunnel";
import { isLiveMeetingLink } from "@/lib/meetingLink";
import { formatSaoPaulo } from "@/lib/timezone";
import { WHATSAPP_URL } from "@/data/site";
import {
  BUSINESS_SEGMENTS,
  COMPANY_SIZE_BANDS,
  DIAG_CONVERSATIONS,
  DIAG_OBJECTIVES,
  DIAG_PROFILES,
  DIAG_PY_STAGES,
  DIAG_SEGMENTS,
  JOB_TITLE_OPTIONS,
  LOT_CODES,
  MARKET_STAGES,
  MARKET_STAGE_COPY,
  PARAGUAY_INTERESTS,
  parseMarketStage,
  PARAGUAY_RELATIONSHIPS,
  PARTICIPATION_INTENTS,
  UNDERSTAND_TOPICS,
} from "@/modules/leads/status";
import {
  INTEREST_STEPS,
  type DiagnosisAnswers,
  type InterestDraft,
  diagnosisLabel,
  draftFromDiagnosis,
  emptyDraft,
  parseUtm,
  validateStep,
} from "@/modules/interest/flow";

type Phase = "intro" | "form" | "verify" | "schedule" | "done";

/** ?origem=… on the CTA → Lead.source, so the CRM knows which part of the site the lead came from. */
function sourceFromOrigin(origin: string | null) {
  if (origin === "proposta") return "interesse-proposta";
  if (origin === "mercado") return "interesse-mercado";
  if (origin === "diagnostico") return "interesse-diagnostico";
  if (origin === "decisao") return "interesse-decisao";
  return "interesse";
}

/** The home page keeps the diagnosis and the Decision Box answer in localStorage until the form is sent. */
function readStored(): { diagnosis: DiagnosisAnswers | null; decision: string } {
  try {
    const raw = JSON.parse(window.localStorage.getItem("provision.diagnosis") || "null");
    const valid =
      raw &&
      (DIAG_SEGMENTS as readonly string[]).includes(raw.segment) &&
      (DIAG_OBJECTIVES as readonly string[]).includes(raw.objective) &&
      (DIAG_PY_STAGES as readonly string[]).includes(raw.pyStage) &&
      (DIAG_CONVERSATIONS as readonly string[]).includes(raw.conversation) &&
      (DIAG_PROFILES as readonly string[]).includes(raw.profile);
    const decision = String(window.localStorage.getItem("provision.decision") || "").slice(0, 1200);
    return { diagnosis: valid ? (raw as DiagnosisAnswers) : null, decision };
  } catch {
    return { diagnosis: null, decision: "" };
  }
}

const TRUST_COPY =
  "Não é necessário ter uma decisão tomada. A primeira conversa serve para entender o momento da sua empresa e avaliar se a PROVISION faz sentido para você.";

const LOT_LABELS: Record<(typeof LOT_CODES)[number], string> = {
  "01": "Lote 01 · R$ 19.997",
  "02": "Lote 02 · R$ 22.997",
  "03": "Lote 03 · R$ 25.997",
  vip: "VIP · R$ 29.997",
};

const TITLES: Record<(typeof INTEREST_STEPS)[number], string> = {
  name: "Como podemos te chamar?",
  contact: "Como podemos falar com você?",
  company: "Qual é a sua empresa?",
  segment: "Em qual segmento sua empresa atua?",
  stage: "Em qual momento sua empresa está?",
  role: "Qual é o seu cargo atual?",
  companySize: "Qual é o porte aproximado da sua empresa?",
  interests: "O que você busca no Paraguai?",
  objective: "O que você espera encontrar nessa imersão?",
  relationship: "Você já possui alguma operação ou relacionamento com o Paraguai?",
  intent: "Qual é o seu nível de interesse em participar?",
  companion: "Deseja participar acompanhado?",
  consent: "Podemos seguir com o contato?",
};

export function InterestExperience() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<InterestDraft>(emptyDraft);
  // Came from "E a sua empresa?" on the site: the stage is pre-selected and the interests step asks what they want to understand.
  const [stageFromLink, setStageFromLink] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisAnswers | null>(null);
  const [decisionBox, setDecisionBox] = useState("");
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
    // Back from the confirmation e-mail: the verify route already issued the lead session.
    const params = new URLSearchParams(window.location.search);
    const lot = params.get("lote");
    if (lot && (LOT_CODES as readonly string[]).includes(lot)) setDraft((current) => ({ ...current, lot }));
    const stored = readStored();
    if (stored.diagnosis) {
      const prefill = draftFromDiagnosis(stored.diagnosis);
      setDiagnosis(stored.diagnosis);
      setDraft((current) => ({ ...current, ...prefill }));
    }
    if (stored.decision) {
      setDecisionBox(stored.decision);
      setDraft((current) => (current.objective ? current : { ...current, objective: stored.decision }));
    }
    const stage = parseMarketStage(params.get("estagio"));
    if (stage) {
      setDraft((current) => ({ ...current, stage }));
      setStageFromLink(true);
    }
    if (params.get("link") === "invalido") {
      setError("Este link de confirmação expirou ou é inválido. Envie a pré-inscrição novamente para receber um novo link.");
    }
    if (params.get("continuar") === "1") {
      fetch("/api/leads/me")
        .then((r) => {
          if (r.ok) setPhase("schedule");
        })
        .catch(() => undefined);
    }
  }, []);

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
        companyName: draft.companyName,
        segment: draft.segment,
        lot: draft.lot || undefined,
        stage: draft.stage || undefined,
        diagnosis: diagnosis ?? undefined,
        decisionBox: decisionBox || undefined,
        jobTitle: draft.jobTitle,
        jobTitleOther: draft.jobTitleOther,
        companySize: draft.companySize,
        interests: draft.interests,
        objective: draft.objective,
        relationship: draft.relationship,
        intent: draft.intent,
        delegationSize: draft.delegationSize ?? undefined,
        companionRequested: draft.companionRequested === true,
        consent: draft.consent,
        source: sourceFromOrigin(new URLSearchParams(window.location.search).get("origem")),
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
    if (json.verificationRequired) {
      setPhase("verify");
      return;
    }
    if (typeof json.token === "string" && json.token) setToken(json.token);
    try {
      window.localStorage.removeItem("provision.decision");
    } catch {
      // storage unavailable: nothing to clean
    }
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
        <p className="text-[11px] tracking-[0.28em] uppercase text-red">PROVISION · Imersão Sem Fronteiras · Paraguai 2026</p>
        <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[1.02] md:text-6xl">Antes de confirmar sua participação, vamos entender seu objetivo.</h1>
        <p className="mt-6 max-w-xl text-lg text-gray">
          São poucas perguntas sobre sua empresa e o que você busca no Paraguai. Com base no seu perfil, a equipe PROVISION orienta sua participação e prepara a conversa com você.
        </p>
        {stageFromLink && draft.stage && (
          <p className="mt-6 w-fit rounded-lg border border-red/60 px-4 py-3 text-xs uppercase tracking-[0.14em] text-white">
            <span className="block text-[10px] tracking-[0.2em] text-gray">Você selecionou:</span>
            <span className="mt-1 block font-bold">{MARKET_STAGE_COPY[draft.stage as (typeof MARKET_STAGES)[number]].selected}</span>
          </p>
        )}
        {diagnosis && (
          <p className="mt-6 w-fit rounded-lg border border-white/20 px-4 py-3 text-xs uppercase tracking-[0.14em] text-white">
            <span className="block text-[10px] tracking-[0.2em] text-gray">Seu perfil PROVISION</span>
            <span className="mt-1 block font-bold">{diagnosisLabel(diagnosis)}</span>
          </p>
        )}
        {(stageFromLink || diagnosis || decisionBox) && <p className="mt-4 max-w-xl text-sm text-gray">{TRUST_COPY}</p>}
        {draft.lot && (
          <p className="mt-6 w-fit rounded-lg border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.14em] text-white">
            Condição de interesse: {LOT_LABELS[draft.lot as (typeof LOT_CODES)[number]]}
          </p>
        )}
        {error && <p className="mt-6 max-w-xl text-red" role="alert">{error}</p>}
        <button
          className="mt-10 min-h-12 w-full rounded-full bg-red px-6 py-4 text-xs font-bold uppercase tracking-[0.12em] sm:w-fit sm:px-8 sm:tracking-[0.16em]"
          onClick={() => {
            trackFunnel("INTEREST_STARTED", { utm, cta: "COMECAR_PRE_INSCRICAO" });
            setPhase("form");
          }}
        >
          Começar&nbsp;→
        </button>
      </section>
    );
  }

  if (phase === "verify") {
    return (
      <section className="flex min-h-[80dvh] flex-col justify-center">
        <p className="text-[11px] tracking-[0.28em] uppercase text-red">Confirme seu e-mail</p>
        <h1 className="mt-6 font-display text-4xl md:text-6xl">Este e-mail já tem uma pré-inscrição.</h1>
        <p className="mt-4 max-w-xl text-gray">
          Por segurança, enviamos um link de confirmação para {draft.email}. Abra o link para continuar e agendar sua conversa.
        </p>
        <p className="mt-3 max-w-xl text-sm text-gray">O link vale por 24 horas. Verifique também a caixa de spam.</p>
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
                  : "Seu horário está confirmado. O consultor vai chamar você pelo WhatsApp informado no horário marcado."}
              </p>
              {meeting.email ? (
                <p className="mt-3 text-white">{meeting.email}</p>
              ) : (
                <p className="mt-3 text-gray">A confirmação foi enviada para o e-mail informado no cadastro.</p>
              )}
              <p className="mt-2 text-sm text-gray">A confirmação também vai por e-mail. Verifique a caixa de spam.</p>
              <a className="mt-4 inline-flex min-h-12 items-center text-xs font-bold uppercase tracking-widest text-white underline" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                Se preferir, fale agora no WhatsApp
              </a>
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
        <p className="text-[11px] tracking-[0.28em] uppercase text-red">Conversa com a equipe PROVISION</p>
        <h1 className="mt-6 max-w-3xl font-display text-4xl md:text-6xl">Com base no seu perfil, nossa equipe vai apresentar a experiência.</h1>
        <p className="mt-4 max-w-xl text-gray">Escolha um dia e horário até 15 de novembro de 2026. O consultor já recebe o contexto da sua empresa e do que você busca no Paraguai.</p>
        <p className="mt-3 text-sm text-white">
          Seu interesse foi registrado. Prefere falar agora?{" "}
          <a className="underline underline-offset-4" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Falar com a equipe PROVISION</a>
        </p>
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
      <h1 className="mt-10 font-display text-4xl leading-tight md:text-6xl">
        {step === "interests" && stageFromLink ? "O que você busca entender no Paraguai?" : TITLES[step]}
      </h1>
      <div className="mt-10 max-w-xl">
        {step === "name" && (
          <label className="block text-sm text-gray">
            Nome completo
            <input
              autoFocus
              autoComplete="name"
              aria-describedby="interest-error"
              className="mt-3 w-full border-b border-white/20 bg-transparent py-3 text-xl outline-none md:text-2xl"
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
                className="mt-3 w-full border-b border-white/20 bg-transparent py-3 text-xl outline-none md:text-2xl"
                inputMode="tel"
                value={draft.whatsapp}
                onChange={(e) => setDraft({ ...draft, whatsapp: e.target.value })}
                autoComplete="tel"
              />
            </label>
            <label className="block text-sm text-gray">
              E-mail
              <input
                className="mt-3 w-full border-b border-white/20 bg-transparent py-3 text-xl outline-none md:text-2xl"
                type="email"
                inputMode="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                autoComplete="email"
              />
            </label>
          </div>
        )}
        {step === "company" && (
          <label className="block text-sm text-gray">
            Nome da empresa
            <input
              autoFocus
              autoComplete="organization"
              aria-describedby="interest-error"
              className="mt-3 w-full border-b border-white/20 bg-transparent py-3 text-xl outline-none md:text-2xl"
              value={draft.companyName}
              onChange={(e) => setDraft({ ...draft, companyName: e.target.value })}
            />
          </label>
        )}
        {step === "segment" && (
          <div className="grid gap-2 sm:grid-cols-2">
            {BUSINESS_SEGMENTS.map((option) => (
              <button
                key={option}
                className={`min-h-12 rounded-xl border px-4 py-3 text-left ${draft.segment === option ? "border-red" : "border-white/15"}`}
                onClick={() => {
                  setDraft({ ...draft, segment: option });
                  trackFunnel("QUESTION_COMPLETED", { step: "segment", utm });
                  setStepIndex((i) => i + 1);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        )}
        {step === "stage" && (
          <div className="grid gap-2">
            {MARKET_STAGES.map((option) => (
              <button
                key={option}
                aria-pressed={draft.stage === option}
                className={`min-h-12 rounded-xl border px-4 py-3 text-left ${draft.stage === option ? "border-red" : "border-white/15"}`}
                onClick={() => {
                  setDraft({ ...draft, stage: option });
                  trackFunnel("QUESTION_COMPLETED", { step: "stage", utm });
                  setStepIndex((i) => i + 1);
                }}
              >
                <span className="block text-sm font-bold uppercase tracking-[0.12em]">{MARKET_STAGE_COPY[option].label}</span>
                <span className="mt-1 block text-sm text-gray">{MARKET_STAGE_COPY[option].detail}</span>
              </button>
            ))}
          </div>
        )}
        {step === "role" && (
          <div className="grid gap-2">
            {JOB_TITLE_OPTIONS.map((option) => (
              <button
                key={option}
                className={`min-h-12 rounded-xl border px-4 py-3 text-left ${draft.jobTitle === option ? "border-red" : "border-white/15"}`}
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
                className={`min-h-12 rounded-xl border px-4 py-3 text-left ${draft.companySize === option ? "border-red" : "border-white/15"}`}
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
          <div className="grid gap-2 sm:grid-cols-2">
            <p className="text-sm text-gray sm:col-span-2">Marque todas as opções que se aplicam.</p>
            {((stageFromLink ? UNDERSTAND_TOPICS : PARAGUAY_INTERESTS) as readonly string[]).map((option) => {
              const on = draft.interests.includes(option);
              return (
                <button
                  key={option}
                  className={`min-h-12 rounded-xl border px-4 py-3 text-left ${on ? "border-red" : "border-white/15"}`}
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
                className={`min-h-12 rounded-xl border px-4 py-3 text-left ${draft.relationship === option ? "border-red" : "border-white/15"}`}
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
                className={`min-h-12 rounded-xl border px-4 py-3 text-left ${draft.intent === option ? "border-red" : "border-white/15"}`}
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
        {step === "companion" && (
          <div className="grid gap-3">
            <p className="text-sm text-gray">
              Participantes que desejarem levar a esposa poderão adquirir um ingresso adicional para sua acompanhante. Esse ingresso é contabilizado separadamente, sem desconto automático, e não entra no ingresso principal.
            </p>
            <button
              className={`min-h-12 rounded-xl border px-4 py-3 text-left ${draft.companionRequested === true ? "border-red" : "border-white/15"}`}
              onClick={() => setDraft({ ...draft, companionRequested: true })}
            >
              Sim, quero um ingresso adicional
            </button>
            <button
              className={`min-h-12 rounded-xl border px-4 py-3 text-left ${draft.companionRequested === false ? "border-red" : "border-white/15"}`}
              onClick={() => setDraft({ ...draft, companionRequested: false })}
            >
              Não
            </button>
          </div>
        )}
        {step === "consent" && (
          <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm text-gray">
            <input
              type="checkbox"
              className="mt-0.5 h-5 w-5 shrink-0 accent-[#ff454a]"
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
      {(stageFromLink || diagnosis || decisionBox) && step === "consent" && <p className="mt-6 max-w-xl text-sm text-gray">{TRUST_COPY}</p>}
      <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap">
        {stepIndex > 0 && (
          <button className="min-h-12 rounded-full border border-white/20 px-6 py-3 text-xs uppercase tracking-widest" onClick={() => setStepIndex(stepIndex - 1)}>
            Voltar
          </button>
        )}
        <button
          disabled={saving}
          className="min-h-12 w-full rounded-full bg-red px-8 py-3 text-xs font-bold uppercase tracking-widest disabled:opacity-50 sm:w-auto"
          onClick={() => void goNext()}
        >
          {saving ? "Salvando…" : step === "consent" ? (stageFromLink || diagnosis || decisionBox ? "Falar com um consultor" : "Enviar pré-inscrição") : "Continuar"}
        </button>
      </div>
    </section>
  );
}
