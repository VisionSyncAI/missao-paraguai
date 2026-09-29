import { addDaysYmd, fromSaoPauloLocal, ymdInSaoPaulo } from "@/lib/timezone";

/** Último dia (inclusive, America/Sao_Paulo) em que a reunião comercial pode ser marcada. */
/** Último dia para agendar conversa comercial (véspera do início da imersão). */
export const BOOKING_LAST_YMD = { year: 2026, month: 11, day: 15 };

export function compareYmd(a: { year: number; month: number; day: number }, b: { year: number; month: number; day: number }) {
  return a.year - b.year || a.month - b.month || a.day - b.day;
}

export function bookingEnd() {
  return fromSaoPauloLocal(BOOKING_LAST_YMD.year, BOOKING_LAST_YMD.month, BOOKING_LAST_YMD.day, 23 * 60 + 59);
}

export function bookingHorizonDays(from = new Date()) {
  const start = ymdInSaoPaulo(from);
  if (compareYmd(start, BOOKING_LAST_YMD) > 0) return 0;
  let count = 0;
  let cursor = start;
  while (compareYmd(cursor, BOOKING_LAST_YMD) <= 0) {
    count += 1;
    cursor = addDaysYmd(cursor.year, cursor.month, cursor.day, 1);
    if (count > 366) break;
  }
  return count;
}

export function includesBookingLastDay(starts: string[]) {
  return starts.some((iso) => {
    const ymd = ymdInSaoPaulo(new Date(iso));
    return compareYmd(ymd, BOOKING_LAST_YMD) === 0;
  });
}
