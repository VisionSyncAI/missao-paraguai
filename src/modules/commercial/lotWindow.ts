export const LOTS = [
  {
    id: "l1",
    label: "LOTE 01",
    priceLabel: "R$ 19.997",
    end: "2026-10-07",
    nextPrice: "R$ 22.997",
    pitch: "Garanta esta condição antes da virada do lote.",
    micro: "Depois desta data, o próximo lote entra em vigor.",
  },
  {
    id: "l2",
    label: "LOTE 02",
    priceLabel: "R$ 22.997",
    end: "2026-10-13",
    nextPrice: "R$ 25.997",
    pitch: "Garanta esta condição antes da próxima virada de lote.",
    micro: "Após esta data, a próxima condição comercial será aplicada.",
  },
  {
    id: "l3",
    label: "LOTE 03",
    priceLabel: "R$ 25.997",
    end: "2026-10-21",
    nextPrice: "R$ 29.997",
    pitch: "Última condição antes da experiência VIP.",
    micro: "Após esta data, a próxima condição comercial será aplicada.",
  },
  {
    id: "vip",
    label: "VIP",
    priceLabel: "R$ 29.997",
    end: "2026-10-26",
    nextPrice: null,
    pitch: "Últimos dias para garantir a experiência VIP.",
    micro: "Após esta data, as inscrições desta edição se encerram.",
  },
] as const;

export type LotId = (typeof LOTS)[number]["id"];

export type LotPhase = "special" | "burning" | "last" | "today" | "closed" | "next" | "vip";

const SEAL: Record<LotPhase, string> = {
  special: "⚡ Condição especial",
  burning: "⚡ Esgotando",
  last: "⚡ Últimos dias",
  today: "⚡ Encerra hoje",
  closed: "Encerrado",
  next: "Próxima condição",
  vip: "Experiência VIP",
};

export function sealLabel(phase: LotPhase) {
  return SEAL[phase];
}

export function saoPauloYmd(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function daysUntil(today: string, end: string) {
  const start = Date.parse(`${today}T12:00:00Z`);
  const finish = Date.parse(`${end}T12:00:00Z`);
  return Math.round((finish - start) / 86_400_000);
}

function phaseForCurrent(id: LotId, daysLeft: number): LotPhase {
  if (daysLeft <= 0) return "today";
  if (id === "vip") return "last";
  if (daysLeft <= 2) return "last";
  if (daysLeft <= 7) return "burning";
  return "special";
}

export type LotSnapshot = {
  id: LotId;
  phase: LotPhase;
  seal: string;
  current: boolean;
};

export type CommercialWindow = {
  today: string;
  closed: boolean;
  currentId: LotId | null;
  lots: LotSnapshot[];
  nextPrice: string | null;
  banner: string;
};

export function commercialWindow(today: string): CommercialWindow {
  if (today >= "2026-10-27") {
    return {
      today,
      closed: true,
      currentId: null,
      nextPrice: null,
      banner: "As inscrições desta edição estão encerradas.",
      lots: LOTS.map((lot) => ({
        id: lot.id,
        phase: "closed",
        seal: SEAL.closed,
        current: false,
      })),
    };
  }

  const current = LOTS.find((lot) => today <= lot.end) ?? null;
  const lots: LotSnapshot[] = LOTS.map((lot) => {
    if (today > lot.end) {
      return { id: lot.id, phase: "closed", seal: SEAL.closed, current: false };
    }
    if (current && lot.id === current.id) {
      const phase = phaseForCurrent(lot.id, daysUntil(today, lot.end));
      return { id: lot.id, phase, seal: SEAL[phase], current: true };
    }
    if (lot.id === "vip") {
      return { id: lot.id, phase: "vip", seal: SEAL.vip, current: false };
    }
    return { id: lot.id, phase: "next", seal: SEAL.next, current: false };
  });

  const phase = lots.find((lot) => lot.current)?.phase;
  const banner =
    phase === "today"
      ? "Esta condição encerra hoje. Depois desta data, a próxima condição comercial será aplicada."
      : phase === "last"
        ? "Últimos dias desta condição. Garanta sua participação antes da próxima virada."
        : phase === "special"
          ? "A condição especial segue aberta até a data de encerramento deste lote."
          : "O lote vigente está chegando ao fim. Garanta sua participação antes da próxima virada de condição.";

  return {
    today,
    closed: false,
    currentId: current?.id ?? null,
    nextPrice: current?.nextPrice ?? null,
    banner,
    lots,
  };
}
