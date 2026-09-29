export function trackFunnel(event: string, extra: Record<string, unknown> = {}) {
  fetch("/api/funnel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event,
      pathname: typeof window !== "undefined" ? window.location.pathname : "",
      source: extra.source,
      cta: extra.cta,
      step: extra.step,
      utm: extra.utm,
    }),
    keepalive: true,
  }).catch(() => undefined);
}
