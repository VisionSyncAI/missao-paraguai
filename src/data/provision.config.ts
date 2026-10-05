/**
 * Commercial source for the app. Must match content/agenda-oficial.json.
 * The signed contract files are not in this repository.
 */
export const PROVISION_PRE_RESERVATION = 3500;

export const PROVISION_LOTS = [
  { code: "01", total: 19997, start: "2026-01-01", end: "2026-10-07" },
  { code: "02", total: 22997, start: "2026-10-08", end: "2026-10-13" },
  { code: "03", total: 25997, start: "2026-10-14", end: "2026-10-21" },
  { code: "VIP", total: 29997, start: "2026-01-01", end: "2026-10-26" },
] as const;

export const PROVISION = {
  companies: 20,
  representativesPerCompany: 3,
  priceUnit: "por participante",
  ticket: "O investimento é por participante. Empresas podem participar com até 3 executivos na mesma edição.",
  hotel: "Crowne Plaza Asunción",
  lodging: "5 noites em 1 apartamento individual por participante",
  preReservation: PROVISION_PRE_RESERVATION,
  lots: PROVISION_LOTS,
} as const;

export function lotBalance(total: number) {
  return total - PROVISION_PRE_RESERVATION;
}

/** The consultant sends the contract. The site does not generate, audit or date the balance. */
export const PAYMENT_CONDITIONS = "Condições de pagamento apresentadas pelo consultor durante a confirmação da participação.";
