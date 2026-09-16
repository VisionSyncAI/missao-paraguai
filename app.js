const WHATSAPP_NUMBER = "5511999999999";

const marketNotes = {
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

const note = document.getElementById("map-note");
document.querySelectorAll("[data-market]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-market]").forEach((el) => el.classList.remove("active"));
    btn.classList.add("active");
    const key = btn.dataset.market;
    note.textContent = marketNotes[key] || "";
  });
});

const counters = document.querySelectorAll("[data-count]");
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const end = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const prefix = el.dataset.prefix || "";
    const decimals = Number(el.dataset.decimals || 0);
    const start = performance.now();
    const duration = 1100;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const value = end * (1 - Math.pow(1 - p, 3));
      el.textContent = `${prefix}${value.toLocaleString("pt-BR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    io.unobserve(el);
  });
}, { threshold: 0.4 });
counters.forEach((el) => io.observe(el));

const form = document.getElementById("preselecao");
const success = document.getElementById("form-success");
form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const message = [
    "Pré-seleção — Missão Paraguai",
    `Nome: ${data.nome}`,
    `Empresa: ${data.empresa}`,
    `Cargo: ${data.cargo}`,
    `WhatsApp: ${data.whatsapp}`,
    `E-mail: ${data.email}`,
    `Cidade/Estado: ${data.cidade}`,
    `Segmento: ${data.segmento}`,
    `Faturamento: ${data.faturamento}`,
    `Funcionários: ${data.funcionarios}`,
    `Objetivo: ${data.objetivo}`,
    `Já opera no Paraguai: ${data.operacao}`,
    `Interesse: ${data.interesse}`,
    `Motivo: ${data.motivo}`,
  ].join("\n");
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  success.style.display = "block";
  form.reset();
});
