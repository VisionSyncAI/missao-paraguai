# Arquitetura

Monólito modular Next.js 15.

```
src/app            UI e route handlers
src/modules        domínio (leads, meetings, comms, scheduling)

Cal.diy é o motor de booking (disponibilidade/conflitos). O CRM permanece no Next.js.
src/lib            prisma, auth, crypto, logger
prisma             SQLite local (trocar para PostgreSQL em produção)
```

Fluxo oficial de captação: Landing → Garantir minha vaga → `/interesse` → `captureInterest` → Lead → CRM → Cal.diy → Meeting.

Landing viva: `public/site.html` (Next iframe em `/`) e `index.html` (espelho). Dívida: unificar numa única fonte.

Produção: rate limit exige Upstash (`UPSTASH_*`); sem Redis o endpoint crítico **fail-closed**. PostgreSQL: `docs/POSTGRES.md`.

Produção: PostgreSQL (`docs/POSTGRES.md`). SQLite é só desenvolvimento local.
