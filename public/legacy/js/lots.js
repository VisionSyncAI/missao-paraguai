const EXECUTIVE = [
  { id: "1", start: "2026-01-01", end: "2026-10-07" },
  { id: "2", start: "2026-10-08", end: "2026-10-13" },
  { id: "3", start: "2026-10-14", end: "2026-10-21" },
];

function todayInSaoPaulo() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function daysUntil(today, end) {
  const startMs = Date.parse(`${today}T12:00:00Z`);
  const endMs = Date.parse(`${end}T12:00:00Z`);
  return Math.round((endMs - startMs) / 86400000);
}

export function executivePhase(today, start, end) {
  if (today < start) return "upcoming";
  if (today > end) return "closed";
  const left = daysUntil(today, end);
  if (left <= 0) return "lastDay";
  if (left <= 3) return "lastDays";
  if (left <= 7) return "ending";
  return "special";
}

export function vipPhase(today) {
  if (today > "2026-10-26") return "closed";
  if (today === "2026-10-26") return "vipLastDay";
  if (today >= "2026-10-22") return "vipLastDays";
  return "vip";
}

const SEAL = {
  upcoming: "Próxima condição",
  special: "⚡ Condição especial",
  ending: "⚡ Esgotando",
  lastDays: "⚡ Últimos dias",
  lastDay: "⚡ Encerra hoje",
  closed: "Encerrado",
  vip: "Experiência VIP",
  vipLastDays: "⚡ Últimos dias",
  vipLastDay: "⚡ Encerra hoje",
};

export function initLots() {
  const root = document.querySelector("#investimento");
  if (!root) return;
  const today = todayInSaoPaulo();
  const closed = today >= "2026-10-27";
  root.querySelectorAll("[data-lots-open]").forEach((node) => {
    node.hidden = closed;
  });
  const closedBox = root.querySelector("[data-lots-closed]");
  if (closedBox) closedBox.hidden = !closed;
  if (closed) return;

  const states = EXECUTIVE.map((lot) => ({ id: lot.id, phase: executivePhase(today, lot.start, lot.end) }));
  const current = states.find((lot) => lot.phase !== "upcoming" && lot.phase !== "closed");
  const vip = vipPhase(today);
  const vipCurrent = !current && vip !== "closed";

  const banner = root.querySelector("[data-lot-banner-copy]");
  if (banner) {
    if (vipCurrent) {
      banner.textContent = vip === "vipLastDay"
        ? "A experiência VIP encerra hoje."
        : "Últimos dias para garantir a experiência VIP.";
    } else if (current && (current.phase === "lastDay")) {
      banner.textContent = "Esta condição encerra hoje. Depois desta data, a próxima condição comercial será aplicada.";
    } else if (current && current.phase === "lastDays") {
      banner.textContent = "Últimos dias desta condição. Garanta sua participação antes da próxima virada.";
    } else {
      banner.textContent = "O lote vigente está chegando ao fim. Garanta sua participação antes da próxima virada de condição.";
    }
  }

  root.querySelectorAll("[data-lot]").forEach((card) => {
    const id = card.getAttribute("data-lot");
    const phase = id === "vip" ? vip : states.find((lot) => lot.id === id)?.phase;
    if (!phase) return;
    const isCurrent = (current && current.id === id) || (id === "vip" && vipCurrent);
    const canBuy = id === "vip" ? phase !== "closed" : Boolean(isCurrent);
    card.classList.toggle("is-current", Boolean(isCurrent));
    card.classList.toggle("is-closed", phase === "closed");
    card.classList.toggle("is-upcoming", phase === "upcoming");
    const seal = card.querySelector("[data-seal]");
    if (seal) seal.textContent = SEAL[phase] || "";
    const cta = card.querySelector("[data-lot-cta]");
    if (cta) cta.hidden = !canBuy;
    card.querySelectorAll("[data-only-current]").forEach((node) => {
      node.hidden = !isCurrent;
    });
    const after = card.querySelector("[data-lot-after]");
    if (after) after.hidden = !isCurrent;
    const urgent = card.querySelector("[data-vip-urgent]");
    if (urgent) urgent.hidden = phase !== "vipLastDays" && phase !== "vipLastDay";
  });
}
