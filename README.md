# Imersão Paraguai

Landing executiva + primeira camada operacional do funil consultivo.

## Desenvolvimento

```bash
copy .env.example .env
npm install
npx prisma generate
npm run db:setup
npm run dev
```

- Site: http://localhost:3000
- Interesse: http://localhost:3000/interesse
- CRM: http://localhost:3000/admin/login
- Participante: http://localhost:3000/login

Preço oficial, gateway e datas da edição são `PENDING_BUSINESS_DECISION` até configuração administrativa. Não há mock de pagamento em produção.

Seed padrão: e-mail `ADMIN_EMAIL` e senha `ADMIN_PASSWORD` do `.env`.

Sem `RESEND_API_KEY`, o e-mail fica em `data/outbox` (dev). Em produção o outbox permanece `PENDING` até configurar o provedor.

## Testes

```bash
npm test
npm run typecheck
npm run build
```

Agenda comercial: Cal.diy (self-hosted) como motor; o CRM continua neste app. Ver `SCHEDULING.md`.

## Arquitetura

Ver `ARCHITECTURE.md`, `DOMAIN.md`, `API.md`, `SECURITY.md`, `LGPD.md`, `CRM.md`.
