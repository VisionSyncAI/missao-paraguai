import { PrismaClient } from "@prisma/client";
import { hashSecret } from "../src/lib/crypto";
import { CONTACT_CONSENT_VERSION, PRIVACY_VERSION, TERMS_VERSION } from "../src/modules/leads/status";

const prisma = new PrismaClient();

async function main() {
  const password = process.env.ADMIN_PASSWORD || "altere-esta-senha";
  const adminEmail = (process.env.ADMIN_EMAIL || "ops@imersaoparaguai.com").toLowerCase();

  const consultant = await prisma.consultant.upsert({
    where: { email: "consultor@imersaoparaguai.com" },
    update: { status: "ACTIVE", name: "Karina Ferreira" },
    create: {
      name: "Karina Ferreira",
      email: "consultor@imersaoparaguai.com",
      phone: process.env.COMMERCIAL_WHATSAPP || null,
      timezone: "America/Sao_Paulo",
      status: "ACTIVE",
    },
  });

  await prisma.consultantAvailability.deleteMany({ where: { consultantId: consultant.id } });
  const windows = [
    { startMinute: 9 * 60, endMinute: 12 * 60 },
    { startMinute: 14 * 60, endMinute: 19 * 60 },
  ];
  for (const dayOfWeek of [1, 2, 3, 4, 5]) {
    for (const window of windows) {
      await prisma.consultantAvailability.create({
        data: {
          consultantId: consultant.id,
          dayOfWeek,
          startMinute: window.startMinute,
          endMinute: window.endMinute,
          slotMinutes: 30,
          active: true,
        },
      });
    }
  }

  await prisma.staffUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash: hashSecret(password), role: "ADMIN", consultantId: consultant.id, name: "Operação Imersão" },
    create: {
      email: adminEmail,
      passwordHash: hashSecret(password),
      name: "Operação Imersão",
      role: "ADMIN",
      consultantId: consultant.id,
    },
  });

  await prisma.presentation.deleteMany();
  await prisma.presentation.create({
    data: {
      title: "Apresentação Executiva — Imersão Paraguai",
      description: "Documento oficial da experiência executiva, entregue após o formulário de interesse.",
      filePath: "content/presentations/imersao-paraguai-executiva.pdf",
      version: "2026.1",
      active: true,
    },
  });

  const docs = [
    {
      type: "PRIVACY_POLICY",
      version: PRIVACY_VERSION,
      title: "Política de Privacidade",
      body: "Os dados do formulário de interesse são usados para contato comercial da Imersão Paraguai, agendamento com consultor e envio da apresentação. Não vendemos bases. CPF, quando informado, fica restrito. Dados de alimentação, quando coletados, destinam-se apenas à operação da missão e acesso limitado.",
    },
    {
      type: "TERMS",
      version: TERMS_VERSION,
      title: "Termos de interesse",
      body: "O envio do formulário não garante vaga nem constitui contratação. A participação depende de qualificação, proposta e pagamento em etapa posterior.",
    },
    {
      type: "CONTACT",
      version: CONTACT_CONSENT_VERSION,
      title: "Consentimento de contato",
      body: "Autorizo contato por e-mail, telefone e WhatsApp sobre a Imersão Paraguai.",
    },
  ];
  for (const doc of docs) {
    await prisma.legalDocument.upsert({
      where: { type_version: { type: doc.type, version: doc.version } },
      update: doc,
      create: doc,
    });
  }

  const settings: { key: string; value: string; decisionStatus: string; notes: string }[] = [
    {
      key: "PAYMENT_GATEWAY",
      value: "",
      decisionStatus: "PENDING_BUSINESS_DECISION",
      notes: "Gateway BR ainda não escolhido. Produção não pode fingir pagamento.",
    },
    {
      key: "OFFICIAL_PRICE_EXECUTIVE",
      value: "",
      decisionStatus: "PENDING_BUSINESS_DECISION",
      notes: "Candidatos em circulação: 1999700 e 1990000 centavos. Não oficializar no código.",
    },
    {
      key: "OFFICIAL_PRICE_VIP",
      value: "",
      decisionStatus: "PENDING_BUSINESS_DECISION",
      notes: "Candidatos em circulação: 2999700 e 2990000 centavos.",
    },
    {
      key: "EDITION_DATES",
      value: "",
      decisionStatus: "PENDING_BUSINESS_DECISION",
      notes: "Datas da edição não são hardcoded. Landing menciona outubro/2026 apenas como copy.",
    },
    {
      key: "NFE",
      value: "disabled",
      decisionStatus: "PENDING_BUSINESS_DECISION",
      notes: "NF-e fora do MVP até decisão.",
    },
    {
      key: "COMPANION_FEATURE",
      value: "disabled",
      decisionStatus: "PENDING_BUSINESS_DECISION",
      notes: "Acompanhante modelado, cobrança desligada.",
    },
    {
      key: "DEFAULT_COHORT_CAPACITY",
      value: "15",
      decisionStatus: "CONFIGURED",
      notes: "Referência comercial atual; capacidade é campo de Cohort, não constante de frontend.",
    },
  ];
  for (const setting of settings) {
    await prisma.businessSetting.upsert({
      where: { key: setting.key },
      update: { notes: setting.notes },
      create: setting,
    });
  }

  const products = [
    { code: "EXECUTIVE", name: "Pacote Executive", kind: "PACKAGE", decisionNote: "PENDING_BUSINESS_DECISION" },
    { code: "VIP", name: "Pacote VIP", kind: "PACKAGE", decisionNote: "PENDING_BUSINESS_DECISION" },
    { code: "GASTRONOMIC_EXPERIENCE", name: "Experiência gastronômica", kind: "ADDON_PRODUCT", decisionNote: "PENDING_BUSINESS_DECISION" },
  ];
  for (const product of products) {
    await prisma.product.upsert({
      where: { code: product.code },
      update: { name: product.name },
      create: product,
    });
  }

  await prisma.addon.upsert({
    where: { code: "COMPANION" },
    update: { enabled: false },
    create: {
      code: "COMPANION",
      name: "Acompanhante",
      enabled: false,
      amountCents: 0,
      decisionStatus: "PENDING_BUSINESS_DECISION",
    },
  });

  const edition = await prisma.edition.upsert({
    where: { id: "edition-default" },
    update: {},
    create: {
      id: "edition-default",
      name: "Imersão Paraguai",
      status: "DRAFT",
      publicCopy: "15 empresários por turma",
    },
  });

  const capacity = Number((await prisma.businessSetting.findUnique({ where: { key: "DEFAULT_COHORT_CAPACITY" } }))?.value || 15);
  const existingCohort = await prisma.cohort.findFirst({ where: { editionId: edition.id, isPublic: true } });
  if (!existingCohort) {
    await prisma.cohort.create({
      data: {
        editionId: edition.id,
        name: "Turma pública",
        capacity,
        status: "OPEN",
        isPublic: true,
      },
    });
  }

  for (const type of [
    { code: "PASSPORT", name: "Passaporte", required: true },
    { code: "VISA", name: "Documento de ingresso", required: true },
    { code: "PHOTO", name: "Foto", required: false },
  ]) {
    await prisma.documentType.upsert({
      where: { code: type.code },
      update: type,
      create: type,
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
