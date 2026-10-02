export const WHATSAPP_NUMBER = "5551997164254";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Olá! Quero falar sobre a Imersão Paraguai.")}`;

export const site = {
  name: "Imersão Paraguai",
  year: "2026",
  organizers: ["Vision Cybero AI", "Proceit"],
  headline: ["O Paraguai mudou.", "Você já percebeu?"],
  subheadline:
    "Uma imersão executiva para entender negócios, comércio, logística, tecnologia e oportunidades em um dos mercados mais estratégicos da América do Sul.",
  officialLine:
    "Uma experiência para conhecer o Paraguai por dentro, com quem entende de tecnologia, negócios e oportunidades.",
  cities: ["Assunção", "Ciudad del Este", "Alto Paraná"],
  citiesNote: "[DESTINOS A CONFIRMAR] demais cidades da edição.",
  prices: {
    immersion: 19997,
    vip: 29997,
    food: 2900,
    currency: "BRL",
    installment: "[CONDIÇÃO DE PARCELAMENTO A CONFIRMAR]",
  },
  group: { perClass: 15 },
  duration: "5 dias",
  included: [
    "Programação executiva de 5 dias",
    "Hotel durante a imersão",
    "Transporte interno (van executiva)",
    "Agenda empresarial e encontros institucionais",
    "Visitas a operações",
    "Rodada de negócios",
    "Orientação de entrada",
  ],
  excluded: [
    "Passagem aérea",
    "Alimentação (pacote gastronômico opcional à parte)",
    "Despesas pessoais",
    "Serviços jurídicos e contábeis individuais",
    "Taxas governamentais individuais",
    "Custos de constituição e implantação de empresa",
  ],
  stats: [
    { value: "[A CONFIRMAR]", label: "empresas e negócios analisados" },
    { value: "[A CONFIRMAR]", label: "visitas técnicas" },
    { value: "[A CONFIRMAR]", label: "especialistas" },
    { value: "[A CONFIRMAR]", label: "horas de conteúdo" },
  ],
  marketFacts: [
    { value: "US$ 16,72 bi", label: "Exportações totais em 2025 · BCP" },
    { value: "US$ 18,11 bi", label: "Importações totais em 2025 · BCP" },
    { value: "US$ 1,24 bi", label: "Exportações de maquila em 2025 · MIC/BCP" },
    { value: "2.300+", label: "Empresas estrangeiras com interesse em investir · REDIEX 2025" },
  ],
};

export const experiences = [
  { n: "01", title: "Comércio", text: "Conheça operações comerciais reais e entenda como o mercado funciona na prática." },
  { n: "02", title: "Logística", text: "Veja de perto a cadeia que conecta Paraguai, Brasil e mercados internacionais." },
  { n: "03", title: "Tecnologia", text: "Conheça empresas, soluções e ecossistemas tecnológicos." },
  { n: "04", title: "Indústria", text: "Entenda operações industriais, produção e expansão." },
  { n: "05", title: "Agronegócio", text: "Explore um dos setores estratégicos da economia paraguaia." },
  { n: "06", title: "Negócios", text: "Conecte-se com empresários e executivos que atuam no mercado." },
];

export const days = [
  {
    day: "Dia 01",
    label: "Mercado",
    title: "Economia, setores e panorama empresarial",
    see: "Consumo, investimentos, oportunidades, tributação, maquila e o mapa de quem já opera.",
    place: "[LOCAL A CONFIRMAR]",
  },
  {
    day: "Dia 02",
    label: "Governo & investimento",
    title: "Reuniões institucionais com autoridades e órgãos estratégicos",
    see: "Investimentos, indústria, comércio, economia, infraestrutura e entrada de capital estrangeiro. Agenda institucional sujeita à confirmação oficial.",
    place: "[LOCAL A CONFIRMAR]",
  },
  {
    day: "Dia 03",
    label: "Indústria & infraestrutura",
    title: "Ver como as empresas estão produzindo",
    see: "Fábricas, parques industriais, centros logísticos e operações empresariais.",
    place: "[LOCAL A CONFIRMAR]",
  },
  {
    day: "Dia 04",
    label: "Rodada de negócios",
    title: "Encontros B2B",
    see: "Empresários, fornecedores, distribuidores, parceiros, operadores logísticos e prestadores.",
    place: "[LOCAL A CONFIRMAR]",
  },
  {
    day: "Dia 05",
    label: "Sua entrada",
    title: "Orientação e próximos passos",
    see: "Estrutura societária, tributação, maquila, logística e encaminhamento. A imersão não conclui constituição nos cinco dias.",
    place: "[LOCAL A CONFIRMAR]",
  },
];

export const takeaways = [
  { n: "01", title: "Networking" },
  { n: "02", title: "Visão de mercado" },
  { n: "03", title: "Conexões empresariais" },
  { n: "04", title: "Insights" },
  { n: "05", title: "Experiência internacional" },
  { n: "06", title: "Plano de ação" },
];

export const deliverables = [
  { title: "Relatório de insights", text: "[FORMATO A CONFIRMAR] síntese para levar à mesa de decisão." },
  { title: "Visit notes", text: "[FORMATO A CONFIRMAR] o que foi visto em cada operação." },
  { title: "Guia do participante", text: "[FORMATO A CONFIRMAR] preparação antes do embarque." },
  { title: "Networking", text: "Grupo limitado a 15 empresários por turma." },
  { title: "Certificado", text: "[A CONFIRMAR] reconhecimento de participação." },
  { title: "Conteúdo exclusivo", text: "Mercado, tributação, maquila, indústria, logística e expansão." },
];

export const faqs = [
  {
    q: "Para quem é a Imersão Paraguai?",
    a: "Empresário industrial, empreendedor, investidor, distribuidor, importador, exportador, gestor de empresa familiar, CEO, sócio, diretor e profissional de expansão. Não é para turismo, compras ou fórmula de enriquecimento.",
  },
  {
    q: "Quais cidades serão visitadas?",
    a: "Assunção, Ciudad del Este e Alto Paraná estão no recorte da imersão. Demais destinos · [A CONFIRMAR].",
  },
  {
    q: "O que está incluído?",
    a: "Programação de 5 dias, hotel, transporte interno da agenda, visitas, encontros institucionais conforme confirmação, rodada de negócios e orientação de entrada.",
  },
  {
    q: "O que não está incluído?",
    a: "Passagem aérea, alimentação (há pacote gastronômico opcional), despesas pessoais, honorários jurídicos/contábeis, taxas governamentais e custos de constituição.",
  },
  {
    q: "Como funciona a programação?",
    a: "Cinco dias: mercado; governo e investimento; indústria e infraestrutura; rodada B2B; estruturação da entrada. Agenda institucional sujeita à confirmação oficial.",
  },
  {
    q: "Quem são os especialistas?",
    a: "[A CONFIRMAR] nomes e instituições da edição. Não publicamos agendas pessoais que ainda não foram confirmadas.",
  },
  {
    q: "Preciso falar espanhol?",
    a: "[A CONFIRMAR] o desenho de tradução da turma. A operação de negócios no Paraguai transita entre espanhol, guarani e português conforme o contexto.",
  },
  {
    q: "Como funciona o pagamento?",
    a: "Imersão R$ 19.900 por participante. VIP Executive R$ 29.900. Gastronomia opcional R$ 2.900. Condições de faturamento e parcelamento · [A CONFIRMAR].",
  },
  {
    q: "Posso participar como empresa?",
    a: "Sim. Sócio ou executivo pode ir, sujeito a vaga e pré-seleção. Cada pessoa ocupa uma vaga. Grupos da mesma empresa: fale com a organização.",
  },
  {
    q: "Como são selecionadas as visitas?",
    a: "Conforme setor, objetivo e perfil da turma, após pré-seleção. A pré-inscrição não garante vaga.",
  },
];

export const speakers = [
  { name: "[NOME A CONFIRMAR]", role: "Especialista", company: "[EMPRESA]", focus: "Comércio e negócios internacionais", photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=70" },
  { name: "[NOME A CONFIRMAR]", role: "Executivo", company: "[EMPRESA]", focus: "Logística e operações", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=70" },
  { name: "[NOME A CONFIRMAR]", role: "Especialista", company: "[EMPRESA]", focus: "Indústria e maquila", photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=70" },
  { name: "[NOME A CONFIRMAR]", role: "Especialista", company: "[EMPRESA]", focus: "Tecnologia e inovação", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=70" },
];

export const cases = [
  { name: "[NOME A CONFIRMAR]", role: "CEO", company: "[EMPRESA]", quote: "Depoimento real entra aqui quando houver autorização." },
  { name: "[NOME A CONFIRMAR]", role: "Founder", company: "[EMPRESA]", quote: "Espaço para o que a pessoa fez depois da imersão — sem inventar resultado." },
  { name: "[NOME A CONFIRMAR]", role: "Diretor", company: "[EMPRESA]", quote: "Foto, vídeo e cargo serão publicados com consentimento." },
];

export const gallery = [
  { src: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=70", tag: "Visita técnica", alt: "Operação industrial" },
  { src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=70", tag: "Networking", alt: "Reunião executiva" },
  { src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1100&q=70", tag: "Empresas", alt: "Centro empresarial" },
  { src: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1000&q=70", tag: "Logística", alt: "Cadeia logística" },
  { src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=70", tag: "Tecnologia", alt: "Ambiente de tecnologia" },
  { src: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=70", tag: "Negócios", alt: "Mesa de negócios" },
];

export const nav = [
  { href: "#por-que-agora", label: "Por que agora" },
  { href: "#o-que-voce-vai-ver", label: "O que você vai ver" },
  { href: "#programa", label: "Programa" },
  { href: "#cases", label: "Cases" },
  { href: "#investimento", label: "Investimento" },
  { href: "#faq", label: "FAQ" },
];

export function money(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}
