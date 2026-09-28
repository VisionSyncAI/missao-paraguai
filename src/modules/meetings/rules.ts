export function slotFitsAvailability(
  dayOfWeek: number,
  minuteOfDay: number,
  duration: number,
  windows: { dayOfWeek: number; startMinute: number; endMinute: number; active: boolean }[],
) {
  return windows.some(
    (w) =>
      w.active &&
      w.dayOfWeek === dayOfWeek &&
      minuteOfDay >= w.startMinute &&
      minuteOfDay + duration <= w.endMinute,
  );
}
