/** Janelas comerciais da PROVISION. A urgência é a data de virada, nunca o estoque. */

export type LotId = "l1" | "l2" | "l3" | "vip";

export type LotPhase = "special" | "running" | "last" | "today" | "closed" | "upcoming" | "vip";

export const LOT_ENDS: Record<LotId, string> = {
  l1: "2026-10-07",
  l2: "2026-10-13",
  l3: "2026-10-21",
  vip: "2026-10-26",
};

export const LOT_PRICES: Record<LotId, string> = {
  l1: "R$ 19.997",
  l2: "R$ 22.997",
  l3: "R$ 25.997",
  vip: "R$ 29.997",
};

const NEXT: Partial<Record<LotId, LotId>> = {
  l1: "l2",
  l2: "l3",
  l3: "vip",
};

export function saoPauloDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function daysUntil(today: string, end: string) {
  const start = Date.parse(`${today}T00:00:00Z`);
  const finish = Date.parse(`${end}T00:00:00Z`);
  return Math.round((finish - start) / 86_400_000);
}

export function inscriptionsClosed(today: string) {
  return today >= "2026-10-27";
}

export function currentLot(today: string): LotId | null {
  if (today <= LOT_ENDS.l1) return "l1";
  if (today <= LOT_ENDS.l2) return "l2";
  if (today <= LOT_ENDS.l3) return "l3";
  if (today <= LOT_ENDS.vip) return "vip";
  return null;
}

export function lotPhase(id: LotId, today: string): LotPhase {
  const end = LOT_ENDS[id];
  if (today > end) return "closed";
  if (id === "vip" && today < "2026-10-22") return "vip";
  if (currentLot(today) !== id) return "upcoming";
  const left = daysUntil(today, end);
  if (left <= 0) return "today";
  if (left <= 3) return "last";
  if (id === "vip") return "last";
  if (left <= 7) return "running";
  return "special";
}

export function phaseLabel(phase: LotPhase) {
  if (phase === "special") return "⚡ CONDIÇÃO ESPECIAL";
  if (phase === "running") return "⚡ ESGOTANDO";
  if (phase === "last") return "⚡ ÚLTIMOS DIAS";
  if (phase === "today") return "⚡ ENCERRA HOJE";
  if (phase === "closed") return "ENCERRADO";
  if (phase === "vip") return "EXPERIÊNCIA VIP";
  return "PRÓXIMA CONDIÇÃO";
}

export function nextPrice(id: LotId) {
  const next = NEXT[id];
  return next ? LOT_PRICES[next] : null;
}
