export function canAssignSeat(seatsTaken: number, capacity: number) {
  return seatsTaken < capacity;
}

export function nextAssignmentStatus(seatsTaken: number, capacity: number) {
  return canAssignSeat(seatsTaken, capacity) ? "CONFIRMED" : "WAITLIST";
}
