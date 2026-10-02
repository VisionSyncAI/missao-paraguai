function interesseHref(search) {
  const params = new URLSearchParams(search);
  const next = new URLSearchParams();
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const value = params.get(key);
    if (value) next.set(key, value);
  }
  const query = next.toString();
  return query ? `/interesse?${query}` : "/interesse";
}

function trackCta() {
  const params = new URLSearchParams(window.location.search);
  const utm = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const value = params.get(key);
    if (value) utm[key] = value;
  }
  fetch("/api/funnel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "INTEREST_CTA_CLICKED",
      cta: "GARANTIR_MINHA_VAGA",
      pathname: window.location.pathname,
      source: params.get("utm_source") || "landing",
      utm,
    }),
    keepalive: true,
  }).catch(() => undefined);
}

/** Adds the page's UTMs to a link into the consultative flow, keeping the link's own params (e.g. lote). */
export function withUtm(target, search) {
  const url = new URL(target, "https://missaoparaguai.com");
  new URL(interesseHref(search), "https://missaoparaguai.com").searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });
  return url.pathname + url.search;
}

export function initForm() {
  const href = interesseHref(window.location.search);
  document.querySelectorAll('a[href^="/interesse"]').forEach((node) => {
    const link = node;
    if (!(link instanceof HTMLAnchorElement)) return;
    link.setAttribute("href", withUtm(link.getAttribute("href") || "/interesse", window.location.search));
    if (window.top !== window) link.target = "_parent";
    link.addEventListener("click", () => trackCta());
  });

  const form = document.getElementById("preselecao");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    trackCta();
    (window.top || window).location.href = href;
  });
}
