#!/bin/bash
set -e

# STM Operações — Instalador automático
# Uso: bash install.sh

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_DIR"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   STM Operações — Instalação         ║"
echo "╚══════════════════════════════════════╝"
echo ""

# 1. Docker
if ! command -v docker &>/dev/null; then
  echo "➤ Instalando Docker..."
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER" 2>/dev/null || true
  echo "✓ Docker instalado"
else
  echo "✓ Docker: $(docker --version | cut -d, -f1)"
fi

# 2. Docker Compose
if ! docker compose version &>/dev/null 2>&1; then
  echo "➤ Instalando Docker Compose plugin..."
  sudo apt-get update -qq
  sudo apt-get install -y docker-compose-plugin
fi
echo "✓ Compose: $(docker compose version --short)"

# 3. .env
if [ ! -f .env ]; then
  echo "➤ Gerando arquivo .env com chaves seguras..."
  JWT_SECRET=$(openssl rand -hex 32)
  VAULT_KEY=$(openssl rand -hex 32)
  PG_PASS=$(openssl rand -hex 16)

  # Valores padrão — editar se quiser customizar
  ADMIN_EMAIL="${ADMIN_EMAIL:-admin@stmarche.com.br}"
  ADMIN_NAME="${ADMIN_NAME:-Admin}"

  cat > .env <<EOF
# Gerado automaticamente em $(date)
POSTGRES_USER=stm
POSTGRES_DB=stm
POSTGRES_PASSWORD=${PG_PASS}
JWT_SECRET=${JWT_SECRET}
VAULT_ENCRYPTION_KEY=${VAULT_KEY}
ADMIN_NAME=${ADMIN_NAME}
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=
HTTP_PORT=80
EOF
  chmod 600 .env
  echo "✓ .env gerado (com secrets aleatórios)"
  echo ""
  echo "  Admin email: ${ADMIN_EMAIL}"
  echo "  Admin nome:  ${ADMIN_NAME}"
  echo "  Senha do admin: será gerada no primeiro start (olhe os logs)"
  echo ""
else
  echo "✓ .env já existe — mantido"
fi

# 4. Build e sobe
echo ""
echo "➤ Construindo imagens (~3-5 min na primeira vez)..."
docker compose build --no-cache

echo ""
echo "➤ Subindo serviços..."
docker compose up -d

echo ""
echo "⏳ Aguardando backend iniciar..."
for i in {1..30}; do
  if docker compose logs backend 2>&1 | grep -q "STM Backend rodando"; then break; fi
  sleep 2
done

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🔑 CREDENCIAIS INICIAIS DO ADMIN"
echo "═══════════════════════════════════════════════════════════"
docker compose logs backend 2>&1 | grep -A 10 "PORTAL INSTALADO" || {
  echo ""
  echo "  (não consegui capturar — rode manualmente:)"
  echo "  docker compose logs backend"
}

IP=$(hostname -I | awk '{print $1}')
echo ""
echo "✅ Instalação concluída!"
echo ""
echo "   Acesse: http://${IP}"
echo ""
echo "   Comandos úteis:"
echo "   • docker compose ps                  — ver status"
echo "   • docker compose logs -f backend     — logs do backend"
echo "   • docker compose logs -f frontend    — logs do frontend"
echo "   • docker compose restart             — reiniciar"
echo "   • docker compose down                — parar tudo"
echo "   • git pull && docker compose up -d --build  — atualizar"
echo ""
echo "   ⚠  As credenciais do admin só aparecem aqui. Anote agora!"
echo "      (Mas você pode rodar novamente: docker compose logs backend)"
