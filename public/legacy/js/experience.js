import { withUtm } from "./form.js";

const prefersReduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const DIAG_KEY = "provision.diagnosis";
const DECISION_KEY = "provision.decision";

/** Same lists as DIAG_* in src/modules/leads/status.ts (tests/diagnosis.test.ts keeps them in sync). */
export const DIAGNOSIS = {
  segment: ["Indústria", "Agro", "Tecnologia", "Logística", "Serviços", "Investimento", "Outro"],
  objective: ["Expansão", "Novos parceiros", "Fornecedores", "Produção", "Logística", "Mercado", "Investimento"],
  pyStage: ["Ainda estou conhecendo", "Já pesquisei", "Já tenho contatos", "Já opero no país", "Estou avaliando expansão"],
  conversation: ["Institucional", "Empresarial", "B2B", "Logística", "Investimento", "Tecnologia"],
  profile: ["Empresário", "Executivo", "Investidor", "Delegação empresarial"],
};

/** @type {Record<string, string>} */
const SLUG = { Indústria: "industria", Agro: "agro", Tecnologia: "tecnologia", Logística: "logistica", Serviços: "servicos", Investimento: "investimento", Outro: "outro" };

/** What the page emphasises for each company profile. Framings of the programme, never new opportunities. */
/** @type {Record<string, { text: string, step2: string[], b2b: string[], sectors: string, layer: string, days: string[] }>} */
export const PROFILE = {
  industria: {
    text: "A partir das suas respostas, sua jornada pode priorizar ambientes industriais, cadeia logística, conexões empresariais e oportunidades de expansão.",
    step2: ["02 — Indústria", "Observar operações e modelos produtivos."],
    b2b: ["Indústria", "Logística", "Fornecedores"],
    sectors: "Indústria, maquila, fornecedores, logística, expansão e B2B.",
    layer: "industria",
    days: ["19"],
  },
  agro: {
    text: "A partir das suas respostas, sua jornada pode priorizar a cadeia do agro, a logística de exportação, a produção e conversas B2B com o setor.",
    step2: ["02 — Agro e cadeia", "Entender cadeia produtiva, logística e exportação."],
    b2b: ["Agro", "Logística", "Exportação"],
    sectors: "Agro, cadeia produtiva, logística, produção, exportação e B2B.",
    layer: "agro",
    days: ["18", "19"],
  },
  tecnologia: {
    text: "A partir das suas respostas, sua jornada pode priorizar infraestrutura, serviços, o ecossistema de tecnologia e conexões com empresas locais.",
    step2: ["02 — Tecnologia", "Conhecer infraestrutura, serviços e ecossistema."],
    b2b: ["Tecnologia", "Infraestrutura", "Serviços"],
    sectors: "Tecnologia, infraestrutura, serviços, ecossistema e conexões.",
    layer: "all",
    days: ["20"],
  },
  logistica: {
    text: "A partir das suas respostas, sua jornada pode priorizar a cadeia logística, a hidrovia, o comércio exterior e conversas B2B.",
    step2: ["02 — Logística", "Ver a cadeia logística, a hidrovia e o comércio exterior."],
    b2b: ["Logística", "Comércio exterior", "Indústria"],
    sectors: "Logística, hidrovia, comércio exterior, indústria e B2B.",
    layer: "logistica",
    days: ["19"],
  },
  investimento: {
    text: "A partir das suas respostas, sua jornada pode priorizar o cenário econômico, os indicadores, o ambiente empresarial e a agenda institucional.",
    step2: ["02 — Cenário", "Ler indicadores, ambiente empresarial e instituições."],
    b2b: ["Instituições", "Ambiente empresarial", "Investimento"],
    sectors: "Cenário, indicadores, ambiente empresarial, oportunidades e instituições.",
    layer: "instituicoes",
    days: ["18"],
  },
  servicos: {
    text: "A partir das suas respostas, sua jornada pode priorizar o ecossistema empresarial, conexões com empresas locais e a leitura do mercado.",
    step2: ["02 — Ecossistema", "Conhecer empresas e atores locais."],
    b2b: ["Ecossistema", "Conexões", "Mercado"],
    sectors: "Ecossistema empresarial, conexões e mercado.",
    layer: "all",
    days: ["20"],
  },
};
PROFILE.outro = PROFILE.servicos;

function track(event, step) {
  try {
    fetch("/api/funnel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, step, pathname: window.location.pathname }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    /* analytics never blocks the visitor */
  }
}

function store(key, value) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
  } catch {
    /* private mode: the experience still works for this visit */
  }
}

function readDiagnosis() {
  try {
    const d = JSON.parse(window.localStorage.getItem(DIAG_KEY) || "null");
    if (!d) return null;
    return Object.keys(DIAGNOSIS).every((k) => DIAGNOSIS[k].includes(d[k])) ? d : null;
  } catch {
    return null;
  }
}

export function diagnosisLabel(d) {
  return [d.segment, d.objective, d.conversation].join(" · ").toUpperCase();
}

/* ---------- Films: real photos as scenes, phrases rendered by the page, optional footage ---------- */
function initFilm(root) {
  const scenes = [...root.querySelectorAll(".film-scene")];
  const toggle = root.querySelector("[data-film-toggle]");
  const sound = root.querySelector("[data-film-sound]");
  const progress = root.querySelector(".film-progress");
  if (!scenes.length) return;
  const bars = scenes.map(() => progress?.appendChild(document.createElement("li")));
  let index = 0;
  let timer = 0;
  let playing = false;
  let userPaused = prefersReduced();
  let video = root.querySelector("video.film-video[data-src]");
  const usingVideo = () => Boolean(video && root.classList.contains("has-video"));

  const show = (i) => {
    index = (i + scenes.length) % scenes.length;
    scenes.forEach((sc, k) => sc.classList.toggle("is-on", k === index));
    bars.forEach((b, k) => {
      if (!b) return;
      b.classList.toggle("is-on", k === index);
      b.classList.toggle("is-done", k < index);
    });
  };
  const hold = () => (scenes[index].classList.contains("is-map") ? 6200 : 4800);
  const tick = () => {
    clearTimeout(timer);
    if (!playing || usingVideo()) return;
    timer = window.setTimeout(() => {
      show(index + 1);
      tick();
    }, hold());
  };
  const setPlaying = (on) => {
    playing = on;
    if (toggle) {
      toggle.textContent = on ? "Pausar" : "Reproduzir";
      toggle.setAttribute("aria-pressed", String(!on));
    }
    if (usingVideo()) {
      if (on) video.play().catch(() => undefined);
      else video.pause();
    }
    tick();
  };

  // Footage loads only when the film is on screen; if it fails, the photo scenes stay.
  const loadVideo = () => {
    if (!video || video.getAttribute("src")) return;
    const mobile = window.innerWidth < 768 && video.dataset.srcMobile;
    video.addEventListener(
      "error",
      () => {
        video?.remove();
        video = null;
        root.classList.remove("has-video");
        if (sound) sound.hidden = true;
        tick();
      },
      { once: true },
    );
    video.addEventListener(
      "loadeddata",
      () => {
        root.classList.add("has-video");
        if (sound) sound.hidden = false;
        setPlaying(playing);
      },
      { once: true },
    );
    video.preload = "auto";
    video.src = mobile ? video.dataset.srcMobile : video.dataset.src;
    video.load();
  };

  toggle?.addEventListener("click", () => {
    userPaused = playing;
    setPlaying(!playing);
  });
  sound?.addEventListener("click", () => {
    if (!video) return;
    video.muted = !video.muted;
    sound.textContent = video.muted ? "Ativar som" : "Desativar som";
    sound.setAttribute("aria-pressed", String(!video.muted));
    if (!video.muted && video.paused) {
      userPaused = false;
      setPlaying(true);
    }
  });

  show(0);
  setPlaying(false);
  if (!("IntersectionObserver" in window)) {
    loadVideo();
    return;
  }
  new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          loadVideo();
          if (!userPaused) setPlaying(true);
        } else {
          setPlaying(false);
        }
      }
    },
    { threshold: 0.45 },
  ).observe(root);
}

/* ---------- Personalisation from the diagnosis ---------- */
export function applyProfile(d) {
  const slug = SLUG[d.segment] || "outro";
  const p = PROFILE[slug];
  document.documentElement.dataset.profile = slug;

  const grid = document.querySelector(".pm-grid");
  if (grid) {
    const cards = [...grid.querySelectorAll(".pm-card")];
    const fit = cards.filter((c) => (c.dataset.tags || "").split(" ").includes(slug));
    cards.forEach((c) => {
      const on = fit.includes(c);
      c.classList.toggle("is-fit", on);
      const badge = c.querySelector(".pm-fit");
      if (badge) badge.hidden = !on;
    });
    fit.reverse().forEach((c) => grid.prepend(c));
  }

  const you = document.querySelector("[data-match-you]");
  const b2b = document.querySelector("[data-match-b2b]");
  const chips = (list) => list.map((t) => `<span>${t}</span>`).join("");
  if (you) you.innerHTML = chips([d.segment, d.objective, d.conversation]);
  if (b2b) b2b.innerHTML = chips(p.b2b);
  const example = document.querySelector("[data-match-example]");
  if (example) example.hidden = true;

  document.querySelectorAll(".journey-day").forEach((day) => day.classList.toggle("is-fit", p.days.includes(day.dataset.day)));
  const sectors = document.querySelector("[data-brief-sectors]");
  if (sectors) sectors.textContent = `Para o seu perfil: ${p.sectors}`;
  document.dispatchEvent(new CustomEvent("provision:profile", { detail: { slug, layer: p.layer } }));
}

/* ---------- Diagnosis ---------- */
function initDiagnosis() {
  const form = document.querySelector("[data-diag]");
  const result = document.querySelector("[data-diag-result]");
  if (!form || !result) return;
  form.classList.add("js-diag");
  const steps = [...form.querySelectorAll("[data-diag-step]")];
  const next = form.querySelector("[data-diag-next]");
  const back = form.querySelector("[data-diag-back]");
  const bar = form.querySelector("[data-diag-bar]");
  const error = form.querySelector("[data-diag-error]");
  let current = 0;
  let started = false;

  const render = () => {
    steps.forEach((s, i) => s.classList.toggle("is-on", i === current));
    if (back) back.hidden = current === 0;
    if (next) next.innerHTML = current === steps.length - 1 ? 'Ver meu perfil <span class="arrow">→</span>' : 'Continuar <span class="arrow">→</span>';
    if (bar) bar.style.width = `${((current + 1) / steps.length) * 100}%`;
    if (error) error.hidden = true;
  };
  const answer = (step) => step.querySelector("input:checked")?.value || "";

  const showResult = (d, scroll) => {
    const slug = SLUG[d.segment] || "outro";
    const p = PROFILE[slug];
    result.querySelector("[data-diag-label]").textContent = diagnosisLabel(d);
    result.querySelector("[data-diag-text]").textContent = p.text;
    result.querySelector("[data-diag-step2-title]").textContent = p.step2[0];
    result.querySelector("[data-diag-step2-text]").textContent = p.step2[1];
    form.hidden = true;
    result.hidden = false;
    applyProfile(d);
    if (scroll) result.focus({ preventScroll: true });
  };

  form.addEventListener("change", () => {
    if (!started) {
      started = true;
      track("DIAGNOSIS_STARTED");
    }
    if (error) error.hidden = true;
  });
  back?.addEventListener("click", () => {
    current = Math.max(0, current - 1);
    render();
    steps[current].querySelector("input")?.focus();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!answer(steps[current])) {
      if (error) error.hidden = false;
      steps[current].querySelector("input")?.focus();
      return;
    }
    if (current < steps.length - 1) {
      current += 1;
      render();
      steps[current].querySelector("input")?.focus();
      return;
    }
    const data = new FormData(form);
    const d = {
      segment: String(data.get("segment")),
      objective: String(data.get("objective")),
      pyStage: String(data.get("pyStage")),
      conversation: String(data.get("conversation")),
      profile: String(data.get("profile")),
      completedAt: new Date().toISOString(),
    };
    store(DIAG_KEY, d);
    track("DIAGNOSIS_COMPLETED", diagnosisLabel(d).slice(0, 40));
    showResult(d, true);
  });
  result.querySelector("[data-diag-redo]")?.addEventListener("click", () => {
    store(DIAG_KEY, null);
    form.reset();
    current = 0;
    form.hidden = false;
    result.hidden = true;
    delete document.documentElement.dataset.profile;
    render();
    steps[0].querySelector("input")?.focus();
  });

  render();
  const saved = readDiagnosis();
  if (saved) showResult(saved, false);
}

/* ---------- Ecosystem map layers ---------- */
function initEcoMap() {
  const group = document.querySelector("[data-eco-layers]");
  const root = document.querySelector("[data-eco]");
  if (!group || !root) return;
  const items = [...root.querySelectorAll(".eco-list li")];
  const pins = [...root.querySelectorAll("[data-pin]")];
  const select = (layer, fromUser) => {
    group.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.layer === layer)));
    const visible = new Set();
    items.forEach((li) => {
      const on = layer === "all" || (li.dataset.layers || "").split(" ").includes(layer);
      li.hidden = !on;
      if (on) visible.add(li.dataset.place);
    });
    pins.forEach((pin) => pin.classList.toggle("is-off", !visible.has(pin.dataset.pin)));
    if (fromUser) track("ECOMAP_LAYER_SELECTED", layer);
  };
  group.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("button[data-layer]") : null;
    if (button) select(button.dataset.layer, true);
  });
  document.addEventListener("provision:profile", (event) => select(event.detail.layer, false));
  select("all", false);
}

/* ---------- Decision box ---------- */
function initDecisionBox() {
  const form = document.querySelector("[data-decision]");
  if (!form) return;
  const field = form.querySelector("textarea");
  const error = form.querySelector("[data-decision-error]");
  try {
    const saved = window.localStorage.getItem(DECISION_KEY);
    if (saved && field) field.value = saved;
  } catch {
    /* ignore */
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = (field?.value || "").trim();
    if (text.length < 3) {
      if (error) error.hidden = false;
      field?.focus();
      return;
    }
    store(DECISION_KEY, text.slice(0, 1200));
    track("DECISION_BOX_SUBMITTED");
    (window.top || window).location.href = withUtm("/interesse?origem=decisao", window.location.search);
  });
  field?.addEventListener("input", () => {
    if (error) error.hidden = true;
  });
}

export function initExperience() {
  document.querySelectorAll("[data-film]").forEach(initFilm);
  initEcoMap();
  initDiagnosis();
  initDecisionBox();
}
