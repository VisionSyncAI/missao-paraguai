# API

Público
- POST /api/leads
- GET /api/leads/me?token=
- GET /api/meetings/availability
- GET /api/scheduling/config
- GET /api/presentations/download?token=
- POST /api/webhooks/cal

Auth
- POST /api/auth/login
- POST /api/auth/logout

Staff (cookie httpOnly)
- GET /api/admin/leads
- GET|PATCH /api/admin/leads/:id
- GET /api/admin/leads/:id/timeline
- PATCH /api/admin/meetings/:id
- GET /api/admin/metrics
- GET|POST /api/admin/proposals
- GET|PATCH /api/admin/proposals/:id
- GET|POST /api/admin/catalog
- GET|POST /api/admin/registrations
- GET|POST /api/admin/orders
- GET /api/admin/payments
- GET /api/admin/participants
- GET|POST /api/admin/cohorts
- GET|POST /api/admin/events
- GET|PATCH|PUT /api/admin/documents
- POST /api/webhooks/payment
- POST /api/auth/participant
- GET /api/participant/me
- PATCH /api/participant/registration
- POST /api/participant/documents
- GET /api/participant/documents/:id

Pagamento em produção sem gateway escolhido: `BLOCKED_BY_BUSINESS_DECISION`.
Sandbox só com `PAYMENT_PROVIDER=sandbox` e `NODE_ENV!==production`.
