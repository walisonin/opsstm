# STM Operações

Portal interno do St Marché — dashboard, chat, fórum, cofre de acessos, ranking, admin.

## Deploy rápido na VPS

```bash
git clone https://github.com/walisonin/opsstm.git
cd opsstm
bash install.sh
```

O script instala Docker (se precisar), faz o build e sobe o container na porta 80.

## Stack

- **Frontend**: Vite + React 18
- **Servidor**: Nginx (Docker)
- **Temas**: Dark / Verde / Claro com seletor

## Módulos

- Login com 2FA
- Dashboard com CRUD de direcionamentos
- Chat estilo Discord (canais, DMs, upload)
- Fórum (moderno ou vBulletin clássico)
- Cofre de credenciais
- Ranking de contribuições
- Perfil e Administração

## Comandos úteis

```bash
docker compose logs -f       # ver logs
docker compose restart       # reiniciar
git pull && docker compose up -d --build  # atualizar
```

## Desenvolvimento local

```bash
npm install
npm run dev    # http://localhost:5173
```
