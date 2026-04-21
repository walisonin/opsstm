#!/bin/bash
set -e

# STM Operações — Script de instalação na VPS
# Execute: bash install.sh

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_NAME="stm-operacoes"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   STM Operações — Instalação         ║"
echo "╚══════════════════════════════════════╝"
echo ""

# 1. Verifica Docker
if ! command -v docker &>/dev/null; then
  echo "➤ Docker não encontrado. Instalando..."
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER"
  echo "✓ Docker instalado. Faça logout e login novamente se necessário."
else
  echo "✓ Docker encontrado: $(docker --version)"
fi

# 2. Verifica Docker Compose
if ! docker compose version &>/dev/null 2>&1; then
  echo "➤ Docker Compose plugin não encontrado. Instalando..."
  sudo apt-get update -qq
  sudo apt-get install -y docker-compose-plugin
fi
echo "✓ Docker Compose: $(docker compose version --short)"

# 3. Build e start
echo ""
echo "➤ Construindo a imagem (pode demorar ~2 min na primeira vez)..."
cd "$REPO_DIR"
docker compose build --no-cache

echo ""
echo "➤ Iniciando o container..."
docker compose up -d

echo ""
echo "✅ STM Operações está rodando!"
echo ""
echo "   Acesse: http://$(hostname -I | awk '{print $1}')"
echo ""
echo "   Comandos úteis:"
echo "   • Parar:       docker compose down"
echo "   • Reiniciar:   docker compose restart"
echo "   • Logs:        docker compose logs -f"
echo "   • Atualizar:   git pull && docker compose up -d --build"
echo ""
