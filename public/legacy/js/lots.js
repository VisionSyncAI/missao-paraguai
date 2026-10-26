const EXECUTIVE = [
  { id: "1", label: "Lote 01", price: "R$ 19.997", start: "2026-01-01", end: "2026-10-07", nextPrice: "R$ 22.997" },
  { id: "2", label: "Lote 02", price: "R$ 22.997", start: "2026-10-08", end: "2026-10-13", nextPrice: "R$ 25.997" },
  { id: "3", label: "Lote 03", price: "R$ 25.997", start: "2026-10-14", end: "2026-10-21", nextPrice: "R$ 29.997" },
];
const VIP_END = "2026-10-26";

const SEAL = {
  special: "⚡ CONDIÇÃO ESPECIAL",
  burning: "⚡ ESGOTANDO",
  last: "⚡ ÚLTIMOS DIAS",
  today: "⚡ ENCERRA HOJE",
  closed: "ENCERRADO",
  upcoming: "PRÓXIMA CONDIÇÃO",
  vip: "EXPERIÊNCIA VIP",
};

function todayInSaoPaulo() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function daysUntil(today, end) {
  const startMs = Date.parse(`${today}T12:00:00Z`);
  const endMs = Date.parse(`${end}T12:00:00Z`);
  return Math.round((endMs - startMs) / 86400000);
}

export function executivePhase(today, start, end) {
  if (today < start) return "upcoming";
  if (today > end) return "closed";
  const left = daysUntil(today, end);
  if (left <= 0) return "today";
  if (left <= 2) return "last";
  if (left <= 7) return "burning";
  return "special";
}

export function vipPhase(today) {
  if (today > VIP_END) return "closed";
  if (today === VIP_END) return "today";
  if (today >= "2026-10-22") return "last";
  return "vip";
}

function ddmm(ymd) {
  return `${ymd.slice(8, 10)}/${ymd.slice(5, 7)}`;
}

function ddmmyyyy(ymd) {
  return `${ymd.slice(8, 10)}/${ymd.slice(5, 7)}/${ymd.slice(0, 4)}`;
}

/** Hero line: lowest condition open today and the date it ends. Same source as the lot cards. */
export function heroOffer(today) {
  const { current, vip, closed } = lotCopy(today);
  if (closed) return { price: "Inscrições encerradas", until: "O período comercial desta edição foi concluído." };
  if (current) return { price: `A partir de ${current.price}`, until: `Condição vigente até ${ddmmyyyy(current.end)}.` };
  return { price: vip === "closed" ? "" : "Experiência VIP · R$ 29.997", until: `Condição vigente até ${ddmmyyyy(VIP_END)}.` };
}

function bannerFor(phase, current, next) {
  if (phase === "today" && next) {
    return "Esta condição encerra hoje. Depois desta data, a próxima condição comercial será aplicada.";
  }
  if (phase === "today") {
    return "Esta condição encerra hoje. Depois desta data, as inscrições desta edição se encerram.";
  }
  if (phase === "last" && !next) {
    return "Últimos dias para garantir a experiência VIP.";
  }
  if (phase === "last") {
    return "Últimos dias desta condição. Garanta sua participação antes da próxima virada.";
  }
  if (phase === "special") {
    return "A condição especial segue aberta até a data de encerramento deste lote.";
  }
  if (next) {
    return `O lote vigente está chegando ao fim. Garanta sua participação antes da próxima virada de condição. Próxima condição: ${next.price}.`;
  }
  return "O lote vigente está chegando ao fim. Garanta sua participação antes da próxima virada de condição.";
}

/**
 * Urgency comes only from the real end date of each commercial condition.
 * Never seats, occupancy or remaining companies.
 */
export function lotCopy(today) {
  const states = EXECUTIVE.map((lot) => ({ ...lot, phase: executivePhase(today, lot.start, lot.end) }));
  const current = states.find((lot) => lot.phase !== "upcoming" && lot.phase !== "closed") || null;
  const vip = vipPhase(today);
  const closed = vip === "closed" && !current;
  const next = current ? states[states.indexOf(current) + 1] || null : null;

  /** @type {Record<string, string>} */
  const seals = {};
  for (const lot of states) seals[lot.id] = SEAL[lot.phase];
  seals.vip = SEAL[vip] || SEAL.vip;

  const banner = closed ? "" : current ? bannerFor(current.phase, current, next) : bannerFor(vip, null, null);
  return { states, current, vip, closed, seals, banner, nextPrice: next?.price || (current ? null : null) };
}

export function initLots() {
  const today = todayInSaoPaulo();
  const offer = heroOffer(today);
  document.querySelectorAll("[data-hero-price]").forEach((node) => {
    node.textContent = offer.price;
  });
  document.querySelectorAll("[data-hero-until]").forEach((node) => {
    node.textContent = offer.until;
  });
  const root = document.querySelector("#investimento");
  if (!root) return;
  const { states, current, vip, closed, seals, banner } = lotCopy(today);
  root.querySelectorAll("[data-lots-open]").forEach((node) => {
    node.hidden = closed;
  });
  const closedBox = root.querySelector("[data-lots-closed]");
  if (closedBox) closedBox.hidden = !closed;
  if (closed) return;

  const vipCurrent = !current && vip !== "closed";
  const bannerCopy = root.querySelector("[data-lot-banner-copy]");
  if (bannerCopy) bannerCopy.textContent = banner;

  root.querySelectorAll("[data-lot]").forEach((card) => {
    const id = card.getAttribute("data-lot");
    const phase = id === "vip" ? vip : states.find((lot) => lot.id === id)?.phase;
    if (!phase) return;
    const isCurrent = (current && current.id === id) || (id === "vip" && vipCurrent);
    const canBuy = id === "vip" ? phase !== "closed" : Boolean(isCurrent);
    card.classList.toggle("is-current", Boolean(isCurrent));
    card.classList.toggle("is-closed", phase === "closed");
    card.classList.toggle("is-upcoming", phase === "upcoming");
    card.classList.toggle("is-urgent", phase === "burning" || phase === "last" || phase === "today");
    const seal = card.querySelector("[data-seal]");
    if (seal) seal.textContent = seals[id] || "";
    const cta = card.querySelector("[data-lot-cta]");
    if (cta) cta.hidden = !canBuy;
    card.querySelectorAll("[data-only-current]").forEach((node) => {
      node.hidden = !isCurrent;
    });
    const after = card.querySelector("[data-lot-after]");
    if (after) after.hidden = !isCurrent;
    const nextLine = card.querySelector("[data-lot-next]");
    if (nextLine) nextLine.hidden = !isCurrent;
  });
}
