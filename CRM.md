# CRM

Pipeline: FORM_SUBMITTED / PRESENTATION_AVAILABLE / MEETING_SCHEDULED / MEETING_COMPLETED / QUALIFIED / PROPOSAL / NEGOTIATION / WON / LOST.

Métricas em /admin/leads: formulários, downloads, reuniões feitas, propostas, fechados.

Timeline por Activity.

Reuniões: uid do Cal.diy em `Meeting.providerBookingUid`. Cancelamento/reagendamento entram por `POST /api/webhooks/cal`.
