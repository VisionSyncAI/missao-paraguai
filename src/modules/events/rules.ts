export const EVENT_TYPES = [
  "OPENING",
  "BUSINESS_VISIT",
  "NETWORKING",
  "MEETING",
  "LECTURE",
  "DINNER",
  "TRANSFER",
  "FREE_TIME",
  "INSTITUTIONAL",
] as const;

export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}
