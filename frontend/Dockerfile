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

# Vite embeds env vars at build time.
# Keep API URL empty in production to use same-origin (/api/ proxied by Nginx).
ARG VITE_API_URL=""
ARG VITE_FIREBASE_API_KEY="AIzaSyCWetlIiNJP94lT5F9JPJpkkysdYV7NCdU"
ARG VITE_FIREBASE_AUTH_DOMAIN="ecodeed-531a1.firebaseapp.com"
ARG VITE_FIREBASE_PROJECT_ID="ecodeed-531a1"
ARG VITE_FIREBASE_STORAGE_BUCKET="ecodeed-531a1.firebasestorage.app"
ARG VITE_FIREBASE_MESSAGING_SENDER_ID="427720723075"
ARG VITE_FIREBASE_APP_ID="1:427720723075:web:353c850ab9213ce726a9b6"
ARG VITE_FIREBASE_MEASUREMENT_ID="G-JN64Y7HSPM"
ARG VITE_PAYSTACK_PUBLIC_KEY="pk_live_6f8072aa57ec87502f915453005dbe1589aecf23"

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY}
ENV VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN}
ENV VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID}
ENV VITE_FIREBASE_STORAGE_BUCKET=${VITE_FIREBASE_STORAGE_BUCKET}
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=${VITE_FIREBASE_MESSAGING_SENDER_ID}
ENV VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID}
ENV VITE_FIREBASE_MEASUREMENT_ID=${VITE_FIREBASE_MEASUREMENT_ID}
ENV VITE_PAYSTACK_PUBLIC_KEY=${VITE_PAYSTACK_PUBLIC_KEY}

RUN npm run build

# ── Production stage ──
FROM nginx:alpine

# Copy the built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
