# Arquitetura

Monólito modular Next.js 15.

```
src/app            UI e route handlers
src/modules        domínio (leads, meetings, comms, scheduling)

Cal.diy é o motor de booking (disponibilidade/conflitos). O CRM permanece no Next.js.
src/lib            prisma, auth, crypto, logger
prisma             SQLite local (trocar para PostgreSQL em produção)
```

A landing (`public/site.html`) permanece. O checkout não existe nesta fase.

Produção: alterar `provider` do Prisma para `postgresql` e definir `DATABASE_URL`.
