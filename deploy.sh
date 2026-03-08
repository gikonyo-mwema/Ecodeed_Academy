#!/bin/bash
# ===========================================
# Build & push production images to Docker Hub
# ===========================================
# Usage:
#   ./deploy.sh                   # builds and pushes
#   ./deploy.sh build             # build only (no push)
#   ./deploy.sh push              # push only (already built)
#
# Prerequisites:
#   docker login     (authenticate to Docker Hub first)
#
# Set your Docker Hub username:
DOCKERHUB_USER="${DOCKERHUB_USER:?Set DOCKERHUB_USER env var (e.g. export DOCKERHUB_USER=gikonyo)}"

set -euo pipefail

BACKEND_IMAGE="${DOCKERHUB_USER}/ecodeed-backend:latest"
FRONTEND_IMAGE="${DOCKERHUB_USER}/ecodeed-frontend:latest"

ACTION="${1:-all}"  # all | build | push

# ── Build ──
if [[ "$ACTION" == "all" || "$ACTION" == "build" ]]; then
    echo "🔨 Building backend image..."
    docker build -t "$BACKEND_IMAGE" ./backend

    echo "🔨 Building frontend image..."
    # Pass build-time env vars for Vite
    docker build \
        --build-arg VITE_API_URL="" \
        -t "$FRONTEND_IMAGE" \
        -f ./frontend/Dockerfile \
        ./frontend

    echo "✅ Images built successfully"
    docker images | grep ecodeed
fi

# ── Push ──
if [[ "$ACTION" == "all" || "$ACTION" == "push" ]]; then
    echo "🚀 Pushing to Docker Hub..."
    docker push "$BACKEND_IMAGE"
    docker push "$FRONTEND_IMAGE"
    echo "✅ Images pushed to Docker Hub"
fi

echo ""
echo "📋 Next steps on your DigitalOcean droplet:"
echo "   1. Copy .env and docker-compose.prod.yml to the server"
echo "   2. Run: docker compose -f docker-compose.prod.yml pull"
echo "   3. Run: docker compose -f docker-compose.prod.yml up -d"
echo "   4. Run: docker compose -f docker-compose.prod.yml exec backend python manage.py migrate"
