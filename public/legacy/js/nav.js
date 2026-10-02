export function initNav() {
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".menu-toggle");
  const drawer = document.querySelector(".drawer");
  const links = [...document.querySelectorAll("[data-nav]")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const onScroll = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
    const y = window.scrollY + 120;
    let current = sections[0];
    sections.forEach((section) => {
      if (section.offsetTop <= y) current = section;
    });
    links.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${current.id}`);
    });
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setDrawer = (open) => {
    drawer.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.style.overflow = open ? "hidden" : "";
    if (open) drawer.querySelector("a")?.focus();
  };
  toggle?.addEventListener("click", () => setDrawer(!drawer.classList.contains("is-open")));
  drawer?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => setDrawer(false));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && drawer?.classList.contains("is-open")) {
      setDrawer(false);
      toggle.focus();
    }
  });
  // The drawer only exists below the desktop nav breakpoint; never leave it open (and the page locked) after a resize.
  window.matchMedia("(min-width: 1101px)").addEventListener("change", (event) => {
    if (event.matches) setDrawer(false);
  });

  const sticky = document.querySelector(".sticky-cta");
  const heroCta = document.querySelector(".hero-cta-wrap");
  if (sticky && heroCta && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      ([entry]) => sticky.classList.toggle("is-on", !entry.isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(heroCta);
  }
}
