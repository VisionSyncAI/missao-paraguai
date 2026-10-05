export const ANALYTICS_DAYS = 7;

export const FORM_STEP_LABELS = [
  ["name", "Nome"],
  ["company", "Empresa"],
  ["role", "Cargo"],
  ["contact", "Contato"],
  ["interests", "Interesse"],
  ["consent", "Consentimento"],
] as const;

export type FunnelCount = { event: string; step: string | null; count: number };

function sum(rows: FunnelCount[], event: string, step?: string) {
  return rows.reduce((total, row) => {
    if (row.event !== event) return total;
    if (step !== undefined && row.step !== step) return total;
    return total + row.count;
  }, 0);
}

/** Turns raw funnel rows into visits, clicks and form progress for the staff board. */
export function shapeSiteAnalytics(rows: FunnelCount[]) {
  const apresentacao = sum(rows, "INTEREST_CTA_CLICKED", "APRESENTACAO");
  return {
    days: ANALYTICS_DAYS,
    visits: sum(rows, "PAGE_VIEW"),
    clicks: {
      participar: sum(rows, "INTEREST_CTA_CLICKED") - apresentacao,
      apresentacao,
      whatsapp: sum(rows, "WHATSAPP_CLICK"),
      faq: sum(rows, "FAQ_OPEN"),
      investimento: sum(rows, "PRICING_VIEW"),
    },
    form: {
      started: sum(rows, "INTEREST_STARTED"),
      decision: sum(rows, "DECISION_BOX_COMPLETE"),
      submitted: sum(rows, "INTEREST_SUBMITTED"),
      steps: FORM_STEP_LABELS.map(([id, label]) => ({
        id,
        label,
        count: sum(rows, "QUESTION_COMPLETED", id),
      })),
    },
  };
}
