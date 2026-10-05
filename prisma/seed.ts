import { PrismaClient } from "@prisma/client";
import { hashSecret } from "../src/lib/crypto";
import { CONTACT_CONSENT_VERSION, PRIVACY_VERSION, TERMS_VERSION } from "../src/modules/leads/status";

const prisma = new PrismaClient();

async function main() {
  const password = process.env.ADMIN_PASSWORD || "altere-esta-senha";
  const adminEmail = (process.env.ADMIN_EMAIL || "ops@imersaoparaguai.com").toLowerCase();

  // Idempotent and non-destructive: this runs before every production deploy, so it only
  // creates missing reference data and never overwrites or deletes what already exists.
  const consultant = await prisma.consultant.upsert({
    where: { email: "consultor@imersaoparaguai.com" },
    update: {},
    create: {
      name: "Karina Ricioni",
      email: "consultor@imersaoparaguai.com",
      phone: process.env.COMMERCIAL_WHATSAPP || "+5551997164254",
      timezone: "America/Sao_Paulo",
      status: "ACTIVE",
    },
  });

  const hasAvailability = (await prisma.consultantAvailability.count({ where: { consultantId: consultant.id } })) > 0;
  const windows = [
    { startMinute: 9 * 60, endMinute: 12 * 60 },
    { startMinute: 14 * 60, endMinute: 19 * 60 },
  ];
  for (const dayOfWeek of hasAvailability ? [] : [1, 2, 3, 4, 5]) {
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
    update: {},
    create: {
      email: adminEmail,
      passwordHash: hashSecret(password),
      name: "Operação Imersão",
      role: "ADMIN",
      consultantId: consultant.id,
    },
  });

  // Presentations are referenced by PresentationDownload (FK RESTRICT): never delete them here.
  const presentationPath = "content/presentations/imersao-paraguai-executiva.pdf";
  const presentation = await prisma.presentation.findFirst({ where: { filePath: presentationPath } });
  const presentationData = {
    title: "Apresentação Executiva — PROVISION Paraguai 2026",
    description: "Documento oficial da experiência executiva, entregue após o formulário de interesse.",
    version: "2026-10-04",
  };
  if (!presentation) {
    await prisma.presentation.create({ data: { ...presentationData, filePath: presentationPath, active: true } });
  } else {
    await prisma.presentation.update({ where: { id: presentation.id }, data: presentationData });
  }

  const docs = [
    {
      type: "PRIVACY_POLICY",
      version: PRIVACY_VERSION,
      title: "Política de Privacidade",
      body: "Texto integral publicado em missaoparaguai.com/privacidade nesta versão. Controladoras: PROCEIT e Vision Cybero AI. Canal do titular: WhatsApp +55 51 99716-4254. Bases legais, prazos de retenção, cookies, operadores e transferência internacional estão descritos na página.",
    },
    {
      type: "TERMS",
      version: TERMS_VERSION,
      title: "Termos de Participação",
      body: "Resumo publicado em missaoparaguai.com/termos nesta versão, a partir dos contratos de participação (Lote 01, 02, 03 e VIP). O envio do formulário não garante vaga nem constitui contratação; vale o contrato assinado.",
    },
    {
      type: "CONTACT",
      version: CONTACT_CONSENT_VERSION,
      title: "Consentimento de contato",
      body: "Autorizo contato por e-mail, telefone e WhatsApp sobre a PROVISION Paraguai 2026.",
    },
  ];
  for (const doc of docs) {
    await prisma.legalDocument.upsert({
      where: { type_version: { type: doc.type, version: doc.version } },
      update: {},
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
      notes: "Landing: imersão de 16 a 21 de novembro de 2026.",
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
    update: {},
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

  // Evidence that the pre-deploy step ran for a given deployment (Railway does not surface its logs).
  await prisma.auditLog.create({
    data: {
      action: "PREDEPLOY_SEED",
      resource: "Deployment",
      resourceId: process.env.RAILWAY_DEPLOYMENT_ID || "local",
      metadata: JSON.stringify({ commit: process.env.RAILWAY_GIT_COMMIT_SHA || null }),
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
