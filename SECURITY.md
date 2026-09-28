# Segurança

- Token de confirmação aleatório; no banco só hash.
- CPF armazenado como hash + last4. CRM mostra máscara. CNPJ completo só ADMIN/FINANCE.
- Alimentação não vai para WhatsApp, e-mail ou DTO do consultor.
- Cookie de staff httpOnly + assinatura HMAC.
- Rate limit em login e POST /leads.
- Consultor só lê leads atribuídos (IDOR).
- Transição de status no servidor.
- SlotLock + transação contra double booking.
- Apresentação via rota autenticada por token, sem URL pública permanente do arquivo.
