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

  toggle?.addEventListener("click", () => {
    const open = !drawer.classList.contains("is-open");
    drawer.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });
  drawer?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      drawer.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
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
