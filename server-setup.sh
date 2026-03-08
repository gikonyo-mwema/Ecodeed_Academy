#!/bin/bash
# ===========================================
# DigitalOcean Droplet Initial Setup
# ===========================================
# Run this ONCE on a fresh Ubuntu 24.04 droplet:
#   curl -sSL https://raw.githubusercontent.com/<you>/Ecodeed_Academy/develop/server-setup.sh | bash
# Or copy it to the server and run: bash server-setup.sh
#
# What it does:
#   1. Installs Docker & Docker Compose
#   2. Creates app directory structure
#   3. Sets up firewall (UFW)
#   4. Configures swap (critical for 2 GB droplet)

set -euo pipefail

echo "🔧 Ecodeed Academy — Server Setup"
echo "==================================="

# ── 1. System updates ──
echo "📦 Updating system packages..."
apt-get update -qq && apt-get upgrade -y -qq

# ── 2. Add 2 GB swap (prevents OOM kills during docker build/pull) ──
echo "💾 Creating 2 GB swap file..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    # Optimize swap behavior for low-RAM server
    sysctl vm.swappiness=10
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
    echo "✅ Swap enabled"
else
    echo "✅ Swap already exists"
fi

# ── 3. Install Docker ──
echo "🐳 Installing Docker..."
if ! command -v docker &>/dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    echo "✅ Docker installed"
else
    echo "✅ Docker already installed"
fi

# ── 4. Firewall ──
echo "🔒 Configuring firewall..."
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
echo "✅ Firewall configured (SSH + HTTP + HTTPS)"

# ── 5. Create app directory ──
echo "📁 Creating app directory..."
mkdir -p /opt/ecodeed
cd /opt/ecodeed

echo ""
echo "✅ Server setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Copy your .env file to /opt/ecodeed/.env"
echo "   2. Copy docker-compose.prod.yml to /opt/ecodeed/"
echo "   3. Set DOCKERHUB_USER in .env"
echo "   4. Run:"
echo "      cd /opt/ecodeed"
echo "      docker compose -f docker-compose.prod.yml pull"
echo "      docker compose -f docker-compose.prod.yml up -d"
echo "      docker compose -f docker-compose.prod.yml exec backend python manage.py migrate"
echo "      docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser"
