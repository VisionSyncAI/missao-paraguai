const EXECUTIVE = [
  { id: "1", label: "Lote 01", price: "R$ 19.997", start: "2026-01-01", end: "2026-10-07" },
  { id: "2", label: "Lote 02", price: "R$ 22.997", start: "2026-10-08", end: "2026-10-13" },
  { id: "3", label: "Lote 03", price: "R$ 25.997", start: "2026-10-14", end: "2026-10-21" },
];
const VIP_END = "2026-10-26";

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
  if (left <= 0) return "lastDay";
  if (left <= 3) return "lastDays";
  if (left <= 7) return "ending";
  return "special";
}

export function vipPhase(today) {
  if (today > VIP_END) return "closed";
  if (today === VIP_END) return "vipLastDay";
  if (today >= "2026-10-22") return "vipLastDays";
  return "vip";
}

function ddmm(ymd) {
  return `${ymd.slice(8, 10)}/${ymd.slice(5, 7)}`;
}

function endsIn(today, end) {
  const left = daysUntil(today, end);
  if (left <= 0) return "encerra hoje";
  if (left === 1) return "encerra amanhã";
  return `encerra em ${left} dias`;
}

function ddmmyyyy(ymd) {
  return `${ymd.slice(8, 10)}/${ymd.slice(5, 7)}/${ymd.slice(0, 4)}`;
}

/** Hero line: lowest condition open today and the date it ends. Same source as the lot table. */
export function heroOffer(today) {
  const { current, vip, closed } = lotCopy(today);
  if (closed) return { price: "Inscrições encerradas", until: "O período comercial desta edição foi concluído." };
  if (current) return { price: `A partir de ${current.price}`, until: `Condição vigente até ${ddmmyyyy(current.end)}.` };
  return { price: vip === "closed" ? "" : "Experiência VIP · R$ 29.997", until: `Condição vigente até ${ddmmyyyy(VIP_END)}.` };
}

/**
 * Commercial urgency comes only from the date-based change of condition: never seats, occupancy
 * or stock. Returns the seal for each card and the banner line for the given São Paulo date.
 */
export function lotCopy(today) {
  const states = EXECUTIVE.map((lot) => ({ ...lot, phase: executivePhase(today, lot.start, lot.end) }));
  const current = states.find((lot) => lot.phase !== "upcoming" && lot.phase !== "closed") || null;
  const vip = vipPhase(today);
  const closed = vip === "closed" && !current;

  /** @type {Record<string, string>} */
  const seals = {};
  for (const lot of states) {
    seals[lot.id] = lot.phase === "upcoming"
      ? `A partir de ${ddmm(lot.start)}`
      : lot.phase === "closed"
        ? "Encerrado"
        : `Vigente · ${endsIn(today, lot.end)}`;
  }
  seals.vip = vip === "closed"
    ? "Encerrado"
    : current
      ? "Experiência VIP"
      : `VIP · ${endsIn(today, VIP_END)}`;

  let banner = "";
  if (current) {
    const next = states[states.indexOf(current) + 1];
    const when = `${endsIn(today, current.end)} (${ddmm(current.end)})`;
    banner = next
      ? `${current.label} vigente: esta condição ${when}. Próxima virada: ${next.label} · ${next.price} a partir de ${ddmm(next.start)}.`
      : `${current.label} vigente: esta condição ${when}. Depois dela, segue apenas a experiência VIP, até ${ddmm(VIP_END)}.`;
  } else if (!closed) {
    banner = `Experiência VIP disponível: ${endsIn(today, VIP_END)} (${ddmm(VIP_END)}). Depois desta data, as inscrições desta edição se encerram.`;
  }
  return { states, current, vip, closed, seals, banner };
}

export function initLots() {
  const today = todayInSaoPaulo();
  const offer = heroOffer(today);
  document.querySelectorAll("[data-hero-price]").forEach((n) => (n.textContent = offer.price));
  document.querySelectorAll("[data-hero-until]").forEach((n) => (n.textContent = offer.until));
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
    const seal = card.querySelector("[data-seal]");
    if (seal) seal.textContent = seals[id] || "";
    const cta = card.querySelector("[data-lot-cta]");
    if (cta) cta.hidden = !canBuy;
    card.querySelectorAll("[data-only-current]").forEach((node) => {
      node.hidden = !isCurrent;
    });
    const after = card.querySelector("[data-lot-after]");
    if (after) after.hidden = !isCurrent;
  });
}
