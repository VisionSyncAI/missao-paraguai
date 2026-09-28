# Scheduling (Cal.diy)

O CRM da Imersão Paraguai é o dono do Lead. Cal.diy / Cal.com é só o motor de agenda.

```
Formulário → reserva no Cal.diy → POST /api/leads (uid verificado)
Cal.diy webhook → Meeting + timeline
```

Variáveis:

- `CAL_API_URL` — API do Cal self-hosted, ex. `https://cal.seudominio.com/api`
- `CAL_EMBED_ORIGIN` — origem do embed, sem path `/embed`
- `CAL_API_KEY`
- `CAL_EVENT_TYPE_ID` e/ou `CAL_EVENT_SLUG` (`usuario/evento`)
- `CAL_WEBHOOK_SECRET`

Webhook da aplicação: `POST /api/webhooks/cal`

O e-mail do organizer no Cal deve ser o mesmo `Consultant.email` do CRM (seed: `consultor@imersaoparaguai.com`).

Em desenvolvimento, se o Cal não estiver configurado, o adapter local de horários permanece ativo. Em produção, sem Cal a agenda retorna 503.

Não exponha a UI nativa do Cal como produto. O embed usa tema escuro/vermelho da Imersão.
