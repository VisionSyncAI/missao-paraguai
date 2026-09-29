# PostgreSQL — plano de produção

O desenvolvimento local continua em SQLite (`DATABASE_URL=file:./dev.db`).
SQLite **não** é a fonte de verdade da operação.

## Variável

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/imersao?schema=public
```

Não inventar host/senha. A URL vem do provedor (Neon, Supabase, RDS, etc.).

## O que o schema já exige no Postgres

- PK `cuid`, FK, `@@unique`, `@@index` — iguais
- Campos JSON hoje são `String` (SQLite). No Postgres podem permanecer `TEXT` ou virar `Json` numa migration futura
- Datas `DateTime` — usar timezone UTC
- Lock de turma: em Postgres `assignPaidParticipant` usa `SELECT … FOR UPDATE` + `UPDATE … WHERE seatsTaken < capacity`. Em SQLite permanece o UPDATE condicional.
- Transações Prisma + unique `Meeting.providerBookingUid` e `PaymentWebhookEvent.uniqueKey`

## Passos (quando a URL existir)

1. Copiar `prisma/schema.prisma`
2. Trocar `provider = "sqlite"` por `provider = "postgresql"`
3. `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/postgres_init.sql`
4. Revisar o SQL (especialmente `String` vs `Json`)
5. `npx prisma migrate deploy` no ambiente com `DATABASE_URL` Postgres
6. `npm run db:seed` só em ambiente vazio
7. Não apontar produção para `file:./dev.db`

## Estado

- Código: **PREPARADO** (plano + schema atual portável)
- Produção: **BLOCKED_BY_ENV** até existir `DATABASE_URL` Postgres
