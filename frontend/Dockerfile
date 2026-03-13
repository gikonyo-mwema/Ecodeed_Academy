# ===========================================
# Production multi-stage build for React frontend
# Stage 1: Build the Vite app
# Stage 2: Serve with Nginx
# ===========================================

# ── Build stage ──
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first (layer caching)
# This layer is only re-run when package*.json changes
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit --no-fund

# Copy source and build
COPY . .

# Vite embeds env vars at build time — pass API URL as empty string
# so the SPA uses relative URLs (Nginx proxies /api/ to Django)
ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ── Production stage ──
FROM nginx:alpine

# Copy the built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
