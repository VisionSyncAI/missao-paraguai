# Segurança

- Token de confirmação aleatório; no banco só hash.
- CPF armazenado como hash + last4. CRM mostra máscara. CNPJ completo só ADMIN/FINANCE.
- Alimentação não vai para WhatsApp, e-mail ou DTO do consultor.
- Cookie de staff e de participante: httpOnly + HMAC-SHA256 (payload mínimo + expiração). `participant.id` cru não autentica.
- Middleware de `/admin` e `/participante` valida assinatura, kind, expiração e role staff — não basta o cookie existir.
- Rate limit: Upstash Redis REST se `UPSTASH_*` existir; senão Map em memória (insuficiente em multi-instância).
- Rate limit em login e POST /leads.
- Consultor só lê leads atribuídos (IDOR).
- Transição de status no servidor.
- SlotLock + transação contra double booking.
- Apresentação via rota autenticada por token, sem URL pública permanente do arquivo.
