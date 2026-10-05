export function initWhy() {
  const items = [...document.querySelectorAll(".why-item")];
  const images = [...document.querySelectorAll(".why-visual img")];
  const activate = (index) => {
    items.forEach((item, i) => item.classList.toggle("is-on", i === index));
    images.forEach((img, i) => img.classList.toggle("is-on", i === index));
  };
  items.forEach((item, index) => {
    item.addEventListener("mouseenter", () => activate(index));
    item.addEventListener("focus", () => activate(index));
    item.addEventListener("click", () => activate(index));
  });
  activate(0);
}

export const marketNotes = {
  Brasil: "Principal destino das exportações paraguaias. Base natural para empresas brasileiras que pensam em uma segunda operação.",
  Argentina: "Segundo grande mercado comprador na região. Relevância direta para estratégia Mercosul.",
  Chile: "Destino relevante para proteínas e alimentos. Exemplo de diversificação sul-americana além do Brasil.",
  "Estados Unidos": "Mercado de maior sofisticação fora da região. Aparece tanto no comércio quanto entre investidores.",
  Uruguai: "Parceiro regional e também presente entre origens de investimento.",
  Europa: "Países Baixos, Espanha e outros destinos europeus aparecem no comércio e no capital investido.",
  China: "Maior origem das importações paraguaias e um dos mercados em expansão nas vendas.",
  Taiwan: "Destino asiático recorrente nas vendas via certificado de origem em 2026.",
  Indonésia: "Mercado asiático em abertura comercial recente.",
  Índia: "Aparece entre compradores asiáticos na diversificação de 2026.",
  Bangladesh: "Destino pontual que ilustra a dispersão da pauta exportadora.",
  Israel: "Presença no Oriente Médio, além dos fluxos sul-americanos.",
  Omã: "Novo destino da maquila em 2025, com produtos alimentícios.",
  Rússia: "Novo destino da maquila em 2025, com produtos cárnicos.",
  Ucrânia: "Novo destino da maquila em 2025, com autopartes.",
  Outros: "Ilhas Cayman, Nepal, Letônia e demais destinos específicos por produto — fluxos menores, mas evidência de plataforma exportadora.",
};

export function initMarkets() {
  const note = document.getElementById("map-note");
  document.querySelectorAll("[data-market]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-market]").forEach((el) => el.classList.remove("is-on"));
      btn.classList.add("is-on");
      note.textContent = marketNotes[btn.dataset.market] || "";
    });
  });
}

export function initRoute() {
  const info = document.getElementById("route-info");
  const title = document.getElementById("route-title");
  document.querySelectorAll("[data-route]").forEach((node) => {
    node.addEventListener("click", () => {
      document.querySelectorAll("[data-route]").forEach((el) => el.classList.remove("is-on"));
      node.classList.add("is-on");
      title.textContent = node.dataset.route;
      info.textContent = node.dataset.copy;
    });
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        node.click();
      }
    });
  });
}

export function initFaq() {
  const buttons = [...document.querySelectorAll(".acc")];
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      if (!expanded) {
        fetch("/api/funnel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: "FAQ_OPEN", cta: button.id || "faq", pathname: window.location.pathname }),
          keepalive: true,
        }).catch(() => undefined);
      }
      buttons.forEach((other) => {
        other.setAttribute("aria-expanded", "false");
        document.getElementById(other.getAttribute("aria-controls"))?.classList.remove("is-open");
      });
      if (!expanded) {
        button.setAttribute("aria-expanded", "true");
        document.getElementById(button.getAttribute("aria-controls"))?.classList.add("is-open");
      }
    });
  });
}

export function initGallery() {
  const box = document.querySelector(".lightbox");
  const img = box?.querySelector("img");
  document.querySelectorAll(".masonry figure").forEach((figure) => {
    figure.addEventListener("click", () => {
      const photo = figure.querySelector("img");
      img.src = photo.currentSrc || photo.src;
      img.alt = photo.alt;
      box.classList.add("is-open");
    });
  });
  box?.addEventListener("click", () => box.classList.remove("is-open"));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") box?.classList.remove("is-open");
  });
}

export function initVideo() {
  const modal = document.querySelector(".modal");
  const video = modal?.querySelector("video");
  document.querySelector(".play")?.addEventListener("click", () => {
    modal.classList.add("is-open");
    video?.play();
  });
  document.querySelector(".modal-close")?.addEventListener("click", () => {
    modal.classList.remove("is-open");
    video?.pause();
  });
}

export function initBenefits() {
  const items = document.querySelectorAll(".benefit");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-on");
    });
  }, { threshold: 0.55 });
  items.forEach((item) => io.observe(item));
}

export function initXpCarousel() {
  const root = document.querySelector("[data-xp]");
  if (!root) return;
  const track = root.querySelector(".xp-track");
  const cards = [...root.querySelectorAll(".xp-card")];
  const prev = root.querySelector("[data-xp-prev]");
  const next = root.querySelector("[data-xp-next]");
  const status = root.querySelector("[data-xp-status]");
  const bar = root.querySelector("[data-xp-bar]");
  let index = 0;
  let startX = 0;
  let delta = 0;
  let dragging = false;

  const go = (nextIndex, animate = true) => {
    index = Math.max(0, Math.min(nextIndex, cards.length - 1));
    const card = cards[0];
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap) || 18;
    const step = card.getBoundingClientRect().width + gap;
    track.style.transition = animate ? "transform 0.62s cubic-bezier(0.22, 1, 0.36, 1)" : "none";
    track.style.transform = `translate3d(${-index * step}px, 0, 0)`;
    cards.forEach((cardEl, i) => cardEl.classList.toggle("is-active", i === index));
    if (status) status.textContent = `${String(index + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
    if (bar) bar.style.width = `${((index + 1) / cards.length) * 100}%`;
    if (prev) prev.disabled = index === 0;
    if (next) next.disabled = index === cards.length - 1;
  };

  prev?.addEventListener("click", () => go(index - 1));
  next?.addEventListener("click", () => go(index + 1));
  window.addEventListener("resize", () => go(index, false));

  track.addEventListener("pointerdown", (event) => {
    dragging = true;
    startX = event.clientX;
    delta = 0;
    track.setPointerCapture(event.pointerId);
  });
  track.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    delta = event.clientX - startX;
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    if (Math.abs(delta) > 48) go(index + (delta < 0 ? 1 : -1));
    else go(index);
  };
  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);

  go(0, false);
}
