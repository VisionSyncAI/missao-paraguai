-- Lead.companyStage (estagio_empresa): PESQUISANDO | AVALIANDO | ESTRUTURANDO | OPERANDO.
-- Local and Railway: applied via `prisma db push` (db:deploy). Nullable, no backfill.
ALTER TABLE "Lead" ADD COLUMN "companyStage" TEXT;
CREATE INDEX "Lead_companyStage_idx" ON "Lead"("companyStage");
