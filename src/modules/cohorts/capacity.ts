export function canAssignSeat(seatsTaken: number, capacity: number) {
  return seatsTaken < capacity;
}

export function nextAssignmentStatus(seatsTaken: number, capacity: number) {
  return canAssignSeat(seatsTaken, capacity) ? "CONFIRMED" : "WAITLIST";
}

/** Simula N tentativas seriais sob a mesma regra atômica (UPDATE seatsTaken < capacity). */
export function simulateSeatRace(capacity: number, requests: number) {
  let seatsTaken = 0;
  let confirmed = 0;
  let waitlisted = 0;
  for (let i = 0; i < requests; i += 1) {
    if (canAssignSeat(seatsTaken, capacity)) {
      seatsTaken += 1;
      confirmed += 1;
    } else {
      waitlisted += 1;
    }
  }
  return { seatsTaken, confirmed, waitlisted };
}
