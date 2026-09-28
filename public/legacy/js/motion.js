import gsap from "https://esm.sh/gsap@3.13.0";
import { ScrollTrigger } from "https://esm.sh/gsap@3.13.0/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const desktop = window.innerWidth > 768;

export function initMotion() {
  document.querySelectorAll(".reveal").forEach((el) => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    io.observe(el);
  });

  if (reduced) return;

  const heroImg = document.querySelector(".hero-media img");
  const heroTitle = document.querySelector(".hero-title");
  const heroSide = document.querySelector(".hero-side");

  if (desktop && heroImg) {
    gsap.to(heroImg, {
      yPercent: 14,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
  }
  if (desktop && heroTitle) {
    gsap.to(heroTitle, {
      y: -48,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
  }
  if (desktop && heroSide) {
    gsap.to(heroSide, {
      y: -18,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
  }

  const track = document.querySelector(".timeline-track");
  const pin = document.querySelector(".timeline-pin");
  const bar = document.querySelector(".progress span");
  if (track && pin && window.innerWidth > 980) {
    const distance = () => track.scrollWidth - window.innerWidth + 80;
    gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: pin,
        start: "top 12%",
        end: () => `+=${distance()}`,
        scrub: 0.6,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          if (bar) bar.style.width = `${Math.max(12, self.progress * 100)}%`;
        },
      },
    });
  }

  document.querySelectorAll("[data-count]").forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: "top 80%",
      once: true,
      onEnter: () => animateCount(el),
    });
  });
}

function animateCount(el) {
  const end = Number(el.dataset.count);
  const suffix = el.dataset.suffix || "";
  const prefix = el.dataset.prefix || "";
  const decimals = Number(el.dataset.decimals || 0);
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min(1, (now - start) / 1100);
    const value = end * (1 - Math.pow(1 - p, 3));
    el.textContent = `${prefix}${value.toLocaleString("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
