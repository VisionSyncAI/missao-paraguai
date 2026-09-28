# Domínio comercial

Lead → Meeting → Consultant
Company 1-N Lead
Lead 1-N Consent, Activity, PresentationDownload, Companion

Status do lead são enum de aplicação (string no SQLite), transições em `src/modules/leads/status.ts`.

Após WON: Registration → Order (preço só via PriceVersion oficial) → Payment (webhook) → Participant → Cohort (lock de capacidade).

Cal.diy continua dono da reunião comercial. MissionEvent é a agenda da missão.

Preço/gateway/datas/NF-e/acompanhante: `BusinessSetting.decisionStatus = PENDING_BUSINESS_DECISION` até decisão humana.
