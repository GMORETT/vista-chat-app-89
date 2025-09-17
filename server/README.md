# Chatwoot BFF Fake Server

Este é um servidor BFF (Backend for Frontend) fake que simula as APIs do Chatwoot para desenvolvimento frontend.

## Instalação

```bash
cd server
npm install
```

## Execução

```bash
npm start
```

O servidor irá rodar em `http://localhost:3001`

## Variáveis de Ambiente

- `ALLOWED_ORIGINS`: Origins permitidas para CORS (separadas por vírgula)
  - Padrão: `http://localhost:5173,http://localhost:3000`

## Rotas Implementadas

### Conversas
- `GET /api/messaging/conversations` - Lista conversas com filtros
- `GET /api/messaging/conversations/meta` - Meta dados (contadores)
- `GET /api/messaging/conversations/:id` - Conversa específica
- `GET /api/messaging/conversations/:id/messages` - Mensagens da conversa
- `POST /api/messaging/conversations/:id/messages` - Enviar mensagem
- `POST /api/messaging/conversations/:id/toggle_status` - Alterar status
- `POST /api/messaging/conversations/:id/toggle_priority` - Alterar prioridade
- `POST /api/messaging/conversations/:id/assign_agent` - Atribuir agente
- `POST /api/messaging/conversations/:id/assign_team` - Atribuir equipe
- `POST /api/messaging/conversations/:id/labels/add` - Adicionar labels
- `POST /api/messaging/conversations/:id/labels/remove` - Remover labels
- `POST /api/messaging/conversations/:id/custom_attributes` - Atributos customizados
- `POST /api/messaging/conversations/:id/mark_read` - Marcar como lida
- `POST /api/messaging/conversations/:id/mark_unread` - Marcar como não lida

### Inboxes
- `GET /api/messaging/inboxes` - Lista inboxes

### Contatos
- `GET /api/messaging/contacts` - Lista contatos
- `GET /api/messaging/contacts/:id` - Contato específico
- `GET /api/messaging/contacts/:id/conversations` - Conversas do contato

### Utilidade
- `GET /health` - Health check

## Funcionalidades

- ✅ Simulação de latência de rede
- ✅ Filtros e paginação
- ✅ Upload de arquivos
- ✅ CORS configurável
- ✅ Dados mock realistas
- ✅ Persistência em memória durante a sessão