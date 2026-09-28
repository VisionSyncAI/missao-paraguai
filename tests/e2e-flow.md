# E2E operacional

1. `/interesse` → Lead + Meeting
2. CRM → QUALIFIED → proposta EXECUTIVE
3. Aceitar proposta → WON → Registration
4. Publicar PriceVersion oficial (admin FINANCE)
5. POST `/api/admin/orders` + checkout
6. Webhook `/api/webhooks/payment` → Participant + Cohort lock
7. `/login` → `/participante` documentos e agenda

Cal.diy real: **BLOCKED** sem `CAL_*` em produção (503, sem adapter local).
Pagamento real: **BLOCKED_BY_BUSINESS_DECISION** até gateway BR.
