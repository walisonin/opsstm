# STM Operações

Portal interno do St Marche — sistema completo com login real, chat em tempo real, fórum, cofre de credenciais, ranking e administração.

## Stack

- **Frontend**: Vite + React 18 + Socket.io client
- **Backend**: Node.js + Express + Prisma + Socket.io
- **Banco**: PostgreSQL 16
- **Auth**: JWT + bcrypt
- **Chat**: WebSockets (Socket.io) — tempo real
- **Cofre**: AES-256-GCM (criptografia server-side)
- **Uploads**: Volume Docker (local na VPS)
- **Deploy**: Docker Compose

## Instalação na VPS

```bash
git clone https://github.com/walisonin/opsstm.git
cd opsstm
bash install.sh
```

O `install.sh` vai:
1. Instalar Docker (se não tiver)
2. Gerar um `.env` com senhas aleatórias seguras (JWT secret, chave do cofre, senha do Postgres)
3. Fazer o build das 3 imagens (postgres + backend + frontend)
4. Subir tudo
5. Mostrar as **credenciais do admin** no log

**Atenção**: a senha do admin é gerada uma única vez e só aparece nos logs da primeira inicialização. Anote!

Para ver de novo:
```bash
docker compose logs backend | grep -A 10 "PORTAL INSTALADO"
```

## Módulos

- **Login** com e-mail e senha, JWT 30 dias, rate limiting
- **Dashboard** com KPIs em tempo real, CRUD de direcionamentos (arrastar para reordenar)
- **Chat** estilo Discord — canais, DMs, indicador de digitação, upload de arquivos
- **Fórum** — categorias, tópicos (fixar/fechar), posts, reações, tags
- **Cofre** — credenciais criptografadas AES-256, busca, tags, audit log
- **Ranking** — reputação baseada em contribuições (posts e respostas)
- **Perfil** — bio, assinatura, cor, troca de senha
- **Admin** — criar/editar usuários, resetar senhas, logs de auditoria

## Perfis (permissões)

- **super_admin** — acesso total, só pode ser criado por outro super_admin
- **admin** — gestão de usuários e conteúdo
- **moderator** — modera fórum e chat, posta avisos
- **member** — usuário padrão

## Comandos úteis

```bash
docker compose ps              # status dos serviços
docker compose logs -f         # todos os logs
docker compose logs -f backend # logs do backend
docker compose restart         # reiniciar
docker compose down            # parar
docker compose up -d --build   # atualizar após git pull

# Entrar no DB Postgres
docker compose exec postgres psql -U stm -d stm

# Backup do banco
docker compose exec postgres pg_dump -U stm stm > backup-$(date +%F).sql
```

## Variáveis de ambiente (`.env`)

| Variável | Obrigatória | Descrição |
|---|---|---|
| `POSTGRES_PASSWORD` | ✅ | Senha do Postgres |
| `JWT_SECRET` | ✅ | Chave do JWT (32+ chars) |
| `VAULT_ENCRYPTION_KEY` | ✅ | Chave AES-256 do cofre (32+ chars) — **NUNCA MUDE** após criar credenciais |
| `ADMIN_EMAIL` | — | E-mail do primeiro admin |
| `ADMIN_NAME` | — | Nome do primeiro admin |
| `ADMIN_PASSWORD` | — | Senha inicial (deixe vazio pra gerar aleatória) |
| `HTTP_PORT` | — | Porta HTTP pública (padrão: 80) |

## Desenvolvimento local

```bash
# Backend
cd backend
npm install
DATABASE_URL="postgresql://..." \
JWT_SECRET="dev" \
VAULT_ENCRYPTION_KEY="dev-key-32-chars-minimum-please" \
  npm run dev

# Frontend (em outro terminal)
cd frontend
npm install
npm run dev    # http://localhost:5173 com proxy /api → :4000
```

## Próximas features (não incluídas nesta versão)

- 📧 Notificações por e-mail (precisa SMTP)
- 🔐 2FA (TOTP com Google Authenticator)
- 🔒 HTTPS automático (Let's Encrypt via Nginx Proxy Manager ou Traefik)
- 💬 DMs privadas entre usuários
- 🔔 Notificações push no navegador
