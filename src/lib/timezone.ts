const ZONE = "America/Sao_Paulo";

function zonedParts(date: Date) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

export function saoPauloOffsetMinutes(date: Date) {
  const p = zonedParts(date);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  return (asUtc - date.getTime()) / 60000;
}

export function fromSaoPauloLocal(year: number, month: number, day: number, minuteOfDay: number) {
  const hour = Math.floor(minuteOfDay / 60);
  const minute = minuteOfDay % 60;
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const offset = saoPauloOffsetMinutes(guess);
  return new Date(guess.getTime() - offset * 60000);
}

export function minuteOfDayInSaoPaulo(date: Date) {
  const p = zonedParts(date);
  return p.hour * 60 + p.minute;
}

export function ymdInSaoPaulo(date: Date) {
  const p = zonedParts(date);
  return { year: p.year, month: p.month, day: p.day };
}

export function addDaysYmd(year: number, month: number, day: number, days: number) {
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  return { year: utc.getUTCFullYear(), month: utc.getUTCMonth() + 1, day: utc.getUTCDate() };
}

export function weekdayInSaoPaulo(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day, 15)).getUTCDay();
}

export function formatSaoPaulo(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: ZONE,
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

export function formatSaoPauloShort(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
