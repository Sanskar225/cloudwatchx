#!/bin/bash
# CloudWatchX AWS EC2 Deployment Script
# Run on fresh Ubuntu 22.04 EC2 instance

set -e

echo "🚀 CloudWatchX AWS Deployment Script"
echo "======================================"

# ─── System Setup ────────────────────────────────────────────
echo "📦 Installing system dependencies..."
sudo apt-get update -qq
sudo apt-get install -y \
  curl git wget unzip \
  ca-certificates gnupg lsb-release \
  nginx certbot python3-certbot-nginx

# ─── Docker ──────────────────────────────────────────────────
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER
  newgrp docker
fi

# Docker Compose
if ! command -v docker-compose &> /dev/null; then
  sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
    -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
fi

# ─── Application Setup ───────────────────────────────────────
echo "📁 Setting up application directory..."
sudo mkdir -p /opt/cloudwatchx
sudo chown $USER:$USER /opt/cloudwatchx
cd /opt/cloudwatchx

# Clone repo (update with your repo URL)
if [ ! -d ".git" ]; then
  git clone https://github.com/YOUR_USERNAME/cloudwatchx.git .
fi

# ─── Environment Configuration ───────────────────────────────
echo "⚙️  Configuring environment..."
if [ ! -f "backend/.env" ]; then
  cp .env.example backend/.env
  echo ""
  echo "⚠️  Please edit backend/.env with your values:"
  echo "   - DATABASE_URL (your RDS endpoint)"
  echo "   - JWT_SECRET (generate with: openssl rand -hex 64)"
  echo "   - JWT_REFRESH_SECRET"
  echo "   - Notification webhooks (optional)"
  echo ""
  read -p "Press Enter after editing .env file..."
fi

# ─── SSL with Let's Encrypt (optional) ───────────────────────
if [ ! -z "$DOMAIN" ]; then
  echo "🔒 Setting up SSL for $DOMAIN..."
  sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m $EMAIL
fi

# ─── Start Services ──────────────────────────────────────────
echo "▶️  Starting CloudWatchX..."
docker compose pull
docker compose up -d

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 15

# Run migrations and seed
echo "🗃️  Running database migrations..."
docker compose exec backend npx prisma migrate deploy

echo "🌱 Seeding database..."
docker compose exec backend npx ts-node prisma/seed.ts || echo "Seed already run"

# ─── Health Check ────────────────────────────────────────────
echo "🏥 Running health checks..."
sleep 5

if curl -sf http://localhost:4000/health > /dev/null; then
  echo "✅ Backend API: Healthy"
else
  echo "❌ Backend API: Unhealthy"
  docker compose logs backend | tail -20
fi

if curl -sf http://localhost:3000 > /dev/null; then
  echo "✅ Frontend: Healthy"
else
  echo "⚠️  Frontend: Check logs with: docker compose logs frontend"
fi

# ─── Firewall ────────────────────────────────────────────────
echo "🔥 Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
# Monitoring ports (restrict to VPN/bastion in production)
sudo ufw allow 9090/tcp  # Prometheus
sudo ufw allow 3001/tcp  # Grafana
sudo ufw allow 9093/tcp  # Alertmanager
echo "y" | sudo ufw enable || true

# ─── PM2 for process management (optional) ───────────────────
# docker compose already handles restarts via restart: unless-stopped

echo ""
echo "🎉 CloudWatchX deployed successfully!"
echo "======================================"
echo "🌐 Application:  http://$(curl -s ifconfig.me)"
echo "📊 Grafana:      http://$(curl -s ifconfig.me):3001  (admin/admin123)"
echo "📈 Prometheus:   http://$(curl -s ifconfig.me):9090"
echo "🔔 Alertmanager: http://$(curl -s ifconfig.me):9093"
echo ""
echo "📧 Default credentials:"
echo "   Admin:  admin@cloudwatchx.io / admin123"
echo "   Viewer: viewer@cloudwatchx.io / viewer123"
echo ""
echo "⚠️  IMPORTANT: Change default passwords immediately!"
