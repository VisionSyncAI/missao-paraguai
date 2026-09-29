"use client";

import { ymdInSaoPaulo } from "@/lib/timezone";

type Slot = { start: string; consultantId: string; consultantName: string };

function dayKey(iso: string) {
  const ymd = ymdInSaoPaulo(new Date(iso));
  return `${ymd.year}-${String(ymd.month).padStart(2, "0")}-${String(ymd.day).padStart(2, "0")}`;
}

function dayLabel(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function timeLabel(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function groupSlotsByDay(slots: Slot[]) {
  const map = new Map<string, Slot[]>();
  for (const slot of slots) {
    const key = dayKey(slot.start);
    map.set(key, [...(map.get(key) || []), slot]);
  }
  return [...map.entries()];
}

export function SlotPicker({
  slots,
  selected,
  onSelect,
}: {
  slots: Slot[];
  selected: string;
  onSelect: (slot: Slot) => void;
}) {
  const grouped = groupSlotsByDay(slots);
  if (grouped.length === 0) {
    return <p className="text-gray">Nenhum horário livre até 16 de outubro de 2026.</p>;
  }
  return (
    <div className="grid gap-8">
      {grouped.map(([key, daySlots]) => (
        <div key={key}>
          <p className="mb-3 text-sm capitalize text-white">{dayLabel(daySlots[0].start)}</p>
          <div className="flex flex-wrap gap-2">
            {daySlots.map((slot) => (
              <button
                key={slot.start}
                type="button"
                className={`rounded-lg border px-3 py-2 text-sm ${selected === slot.start ? "border-red bg-red" : "border-white/15"}`}
                onClick={() => onSelect(slot)}
              >
                {timeLabel(slot.start)}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
