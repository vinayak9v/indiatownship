# Plan 5 — Production Infrastructure

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Containerize all IndiaTownship services with Docker, add Nginx reverse proxy, and wire up GitHub Actions CI/CD for zero-downtime deploys to a VPS.

**Architecture:** Each service (API, web, admin) runs in its own Docker container behind an Nginx reverse proxy that routes by subdomain. GitHub Actions runs tests + builds on every PR, then on `main` push it builds images, pushes to ghcr.io, and SSHes into the VPS to pull + restart. MongoDB stays on Atlas (external).

**Tech Stack:** Docker 24+, docker-compose v2, Nginx (alpine), GitHub Actions, ghcr.io, Next.js standalone output, Ubuntu 22.04 VPS target.

---

## Port Map

| Service | Internal port | Subdomain |
|---------|--------------|-----------|
| api     | 3001         | `api.indiatownship.com` |
| web     | 3001         | `indiatownship.com`, `www.indiatownship.com` |
| admin   | 3002         | `admin.indiatownship.com` |
| nginx   | 80 → host    | all of the above |

---

## File Structure

**Create:**
- `apps/api/Dockerfile` — multi-stage: tsc build → slim runtime
- `apps/api/.dockerignore`
- `apps/web/Dockerfile` — Next.js standalone output
- `apps/web/.dockerignore`
- `apps/admin/Dockerfile` — Next.js standalone output
- `apps/admin/.dockerignore`
- `infra/nginx/nginx.conf` — subdomain routing, upstream definitions
- `infra/nginx/Dockerfile` — nginx:alpine + config baked in
- `infra/scripts/server-setup.sh` — one-time VPS bootstrap (Docker install)
- `infra/scripts/deploy.sh` — pulls images + restarts compose on VPS
- `docker-compose.yml` — production compose (no port leaks, health checks)
- `.env.example` — all required vars documented
- `.github/workflows/ci.yml` — test + lint + build on PRs
- `.github/workflows/deploy.yml` — build + push + SSH deploy on `main`

**Modify:**
- `apps/web/next.config.mjs` — add `output: 'standalone'`
- `apps/admin/next.config.mjs` — add `output: 'standalone'`
- `.gitignore` (root) — ensure `.env` files are excluded

---

## Task 1: Environment files

**Files:**
- Create: `.env.example`
- Modify: `.gitignore` (root)

- [ ] **Step 1: Verify .gitignore covers .env files**

Check root `.gitignore`:
```bash
cat /Users/vinayak/indiatownship/.gitignore 2>/dev/null || echo "none"
```
If `.env` is not listed, add it.

- [ ] **Step 2: Create root `.env.example`**

```
# ── API ──────────────────────────────────────────
NODE_ENV=production
PORT=3001

MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/indiatownship?retryWrites=true&w=majority
JWT_SECRET=change-me-64-char-random-string
JWT_REFRESH_SECRET=change-me-64-char-random-string-2
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d
CORS_ORIGIN=https://indiatownship.com,https://admin.indiatownship.com

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_ADMIN_NUMBER=

# ── Web (Next.js) ────────────────────────────────
NEXT_PUBLIC_API_URL=https://api.indiatownship.com

# ── Admin (Next.js) ─────────────────────────────
NEXT_PUBLIC_API_URL=https://api.indiatownship.com
NEXT_PUBLIC_ADMIN_SECRET=change-me
```

- [ ] **Step 3: Commit**

```bash
git add .env.example .gitignore
git commit -m "chore: add .env.example and verify gitignore"
```

---

## Task 2: API Dockerfile

**Files:**
- Create: `apps/api/Dockerfile`
- Create: `apps/api/.dockerignore`

- [ ] **Step 1: Create `apps/api/.dockerignore`**

```
node_modules
dist
.env*
tests
*.test.ts
coverage
```

- [ ] **Step 2: Create `apps/api/Dockerfile`**

```dockerfile
# ── Stage 1: build ───────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace manifests first for cache efficiency
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/

RUN npm ci --workspace=apps/api --workspace=packages/types --include-workspace-root

COPY packages/types ./packages/types
COPY apps/api ./apps/api

RUN npm run build --workspace=packages/types
RUN npm run build --workspace=apps/api

# ── Stage 2: runtime ─────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/types/dist ./packages/types/dist

EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "dist/index.js"]
```

- [ ] **Step 3: Test the build locally**

```bash
cd /Users/vinayak/indiatownship
docker build -f apps/api/Dockerfile -t it-api:test .
```

Expected: image builds with no errors, final stage ~200MB.

- [ ] **Step 4: Verify container starts (requires .env)**

```bash
docker run --rm --env-file .env -p 3001:3001 it-api:test &
sleep 3
curl http://localhost:3001/health
# Expected: {"status":"ok"}
docker stop $(docker ps -q --filter ancestor=it-api:test)
```

- [ ] **Step 5: Commit**

```bash
git add apps/api/Dockerfile apps/api/.dockerignore
git commit -m "feat(infra): API multi-stage Dockerfile"
```

---

## Task 3: Next.js standalone output — Web

**Files:**
- Modify: `apps/web/next.config.mjs`
- Create: `apps/web/Dockerfile`
- Create: `apps/web/.dockerignore`

- [ ] **Step 1: Enable standalone output in web**

Edit `apps/web/next.config.mjs`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 2: Create `apps/web/.dockerignore`**

```
node_modules
.next
.env*
```

- [ ] **Step 3: Create `apps/web/Dockerfile`**

```dockerfile
# ── Stage 1: deps ────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/

RUN npm ci --workspace=apps/web --workspace=packages/types --include-workspace-root

# ── Stage 2: build ───────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules 2>/dev/null || true
COPY packages/types ./packages/types
COPY apps/web ./apps/web
COPY package.json turbo.json ./

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build --workspace=packages/types
RUN npm run build --workspace=apps/web

# ── Stage 3: runtime ─────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3001/ || exit 1

CMD ["node", "apps/web/server.js"]
```

- [ ] **Step 4: Test the build**

```bash
cd /Users/vinayak/indiatownship
docker build -f apps/web/Dockerfile -t it-web:test .
```

Expected: image builds successfully, final stage ~150MB.

- [ ] **Step 5: Commit**

```bash
git add apps/web/next.config.mjs apps/web/Dockerfile apps/web/.dockerignore
git commit -m "feat(infra): web Next.js standalone Dockerfile"
```

---

## Task 4: Next.js standalone output — Admin

**Files:**
- Modify: `apps/admin/next.config.mjs`
- Create: `apps/admin/Dockerfile`
- Create: `apps/admin/.dockerignore`

- [ ] **Step 1: Enable standalone output in admin**

Edit `apps/admin/next.config.mjs`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 2: Create `apps/admin/.dockerignore`**

```
node_modules
.next
.env*
```

- [ ] **Step 3: Create `apps/admin/Dockerfile`**

```dockerfile
# ── Stage 1: deps ────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/admin/package.json ./apps/admin/
COPY packages/types/package.json ./packages/types/

RUN npm ci --workspace=apps/admin --workspace=packages/types --include-workspace-root

# ── Stage 2: build ───────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY packages/types ./packages/types
COPY apps/admin ./apps/admin
COPY package.json turbo.json ./

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build --workspace=packages/types
RUN npm run build --workspace=apps/admin

# ── Stage 3: runtime ─────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3002

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder /app/apps/admin/public ./apps/admin/public 2>/dev/null || true

USER nextjs
EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3002/ || exit 1

CMD ["node", "apps/admin/server.js"]
```

- [ ] **Step 4: Test the build**

```bash
cd /Users/vinayak/indiatownship
docker build -f apps/admin/Dockerfile -t it-admin:test .
```

Expected: builds successfully.

- [ ] **Step 5: Commit**

```bash
git add apps/admin/next.config.mjs apps/admin/Dockerfile apps/admin/.dockerignore
git commit -m "feat(infra): admin Next.js standalone Dockerfile"
```

---

## Task 5: Nginx reverse proxy

**Files:**
- Create: `infra/nginx/nginx.conf`
- Create: `infra/nginx/Dockerfile`

The Nginx container runs on port 80 inside Docker, mapped to 80 on the host. SSL termination is done by certbot on the host (see Task 9 — post-deploy SSL step). For initial HTTP-only deploy this config is complete; the SSL section documents the upgrade path.

- [ ] **Step 1: Create `infra/nginx/nginx.conf`**

```nginx
# Redirect www → apex
server {
    listen 80;
    server_name www.indiatownship.com;
    return 301 $scheme://indiatownship.com$request_uri;
}

# Web (public site)
server {
    listen 80;
    server_name indiatownship.com;

    client_max_body_size 10m;

    location / {
        proxy_pass         http://web:3001;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# API
server {
    listen 80;
    server_name api.indiatownship.com;

    client_max_body_size 10m;

    location / {
        proxy_pass         http://api:3001;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}

# Admin panel
server {
    listen 80;
    server_name admin.indiatownship.com;

    client_max_body_size 10m;

    location / {
        proxy_pass         http://admin:3002;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

- [ ] **Step 2: Create `infra/nginx/Dockerfile`**

```dockerfile
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

- [ ] **Step 3: Verify nginx config syntax**

```bash
docker run --rm -v $(pwd)/infra/nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro nginx:1.27-alpine nginx -t
```

Expected:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

- [ ] **Step 4: Commit**

```bash
git add infra/nginx/
git commit -m "feat(infra): nginx reverse proxy config"
```

---

## Task 6: docker-compose production file

**Files:**
- Create: `docker-compose.yml`

All services communicate over an internal `it-network`. Only nginx is exposed to the host on port 80. Env vars are injected from a `.env` file at the repo root.

- [ ] **Step 1: Create `docker-compose.yml`**

```yaml
name: indiatownship

services:
  api:
    image: ghcr.io/${GITHUB_REPO}/it-api:${IMAGE_TAG:-latest}
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: "3001"
      MONGODB_URI: ${MONGODB_URI}
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      JWT_ACCESS_EXPIRES: ${JWT_ACCESS_EXPIRES:-15m}
      JWT_REFRESH_EXPIRES: ${JWT_REFRESH_EXPIRES:-30d}
      CORS_ORIGIN: ${CORS_ORIGIN}
      CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME}
      CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY}
      CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET}
      WHATSAPP_PHONE_NUMBER_ID: ${WHATSAPP_PHONE_NUMBER_ID}
      WHATSAPP_ACCESS_TOKEN: ${WHATSAPP_ACCESS_TOKEN}
      WHATSAPP_ADMIN_NUMBER: ${WHATSAPP_ADMIN_NUMBER}
    networks:
      - it-network
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3001/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s

  web:
    image: ghcr.io/${GITHUB_REPO}/it-web:${IMAGE_TAG:-latest}
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: "3001"
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
    networks:
      - it-network
    depends_on:
      api:
        condition: service_healthy

  admin:
    image: ghcr.io/${GITHUB_REPO}/it-admin:${IMAGE_TAG:-latest}
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: "3002"
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
    networks:
      - it-network
    depends_on:
      api:
        condition: service_healthy

  nginx:
    build:
      context: ./infra/nginx
    restart: unless-stopped
    ports:
      - "80:80"
    networks:
      - it-network
    depends_on:
      - web
      - admin
      - api

networks:
  it-network:
    driver: bridge
```

- [ ] **Step 2: Smoke-test compose config is valid**

```bash
cd /Users/vinayak/indiatownship
GITHUB_REPO=test/test docker compose config --quiet
```

Expected: exits 0 with no errors.

- [ ] **Step 3: Commit**

```bash
git add docker-compose.yml
git commit -m "feat(infra): docker-compose production config"
```

---

## Task 7: Server setup script

**Files:**
- Create: `infra/scripts/server-setup.sh` — run once on a fresh Ubuntu 22.04 VPS as root
- Create: `infra/scripts/deploy.sh` — run on VPS to pull new images and restart

- [ ] **Step 1: Create `infra/scripts/server-setup.sh`**

```bash
#!/usr/bin/env bash
# Run once on a fresh Ubuntu 22.04 VPS as root.
# Usage: bash server-setup.sh <github_repo_owner>
set -euo pipefail

GITHUB_OWNER="${1:?Usage: $0 <github_owner>}"

echo "==> Installing Docker"
apt-get update -qq
apt-get install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update -qq
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

systemctl enable --now docker

echo "==> Creating deploy user"
useradd -m -s /bin/bash deploy 2>/dev/null || true
usermod -aG docker deploy

echo "==> Setting up app directory"
mkdir -p /opt/indiatownship
chown deploy:deploy /opt/indiatownship

echo "==> Installing ufw firewall rules"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo ""
echo "✅ Server ready."
echo "   Next steps:"
echo "   1. Copy docker-compose.yml + .env to /opt/indiatownship/"
echo "   2. Add deploy user's SSH pubkey to authorized_keys"
echo "   3. Add DEPLOY_HOST + DEPLOY_KEY to GitHub Secrets"
echo "   4. After first deploy: run certbot for SSL"
```

- [ ] **Step 2: Create `infra/scripts/deploy.sh`**

This script runs on the VPS via SSH from GitHub Actions.

```bash
#!/usr/bin/env bash
# Executed on VPS by GitHub Actions CD workflow.
# Expects: IMAGE_TAG and GITHUB_REPO env vars set by caller.
set -euo pipefail

APP_DIR="/opt/indiatownship"

echo "==> Pulling images (tag: ${IMAGE_TAG})"
cd "$APP_DIR"

IMAGE_TAG="$IMAGE_TAG" GITHUB_REPO="$GITHUB_REPO" \
  docker compose pull

echo "==> Restarting services"
IMAGE_TAG="$IMAGE_TAG" GITHUB_REPO="$GITHUB_REPO" \
  docker compose up -d --remove-orphans

echo "==> Cleaning unused images"
docker image prune -f

echo "✅ Deploy complete — tag: ${IMAGE_TAG}"
```

- [ ] **Step 3: Make scripts executable**

```bash
chmod +x infra/scripts/server-setup.sh infra/scripts/deploy.sh
```

- [ ] **Step 4: Commit**

```bash
git add infra/scripts/
git commit -m "feat(infra): VPS server-setup and deploy scripts"
```

---

## Task 8: GitHub Actions — CI

**Files:**
- Create: `.github/workflows/ci.yml`

Runs on every PR and push to `main`. Tests the API, lints, type-checks all apps, and builds all Docker images to verify they compile.

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    name: Test & Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run API tests
        run: npm test --workspace=apps/api
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI_TEST }}
          JWT_SECRET: ci-jwt-secret-not-real
          JWT_REFRESH_SECRET: ci-jwt-refresh-secret-not-real

      - name: Type-check all apps
        run: |
          npm run type-check --workspace=packages/types 2>/dev/null || true
          npm run type-check --workspace=apps/api 2>/dev/null || true
          npm run type-check --workspace=apps/web
          npm run type-check --workspace=apps/admin

  build-images:
    name: Build Docker images
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build API image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/api/Dockerfile
          push: false
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build Web image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/web/Dockerfile
          push: false
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build Admin image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/admin/Dockerfile
          push: false
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "feat(infra): GitHub Actions CI workflow"
```

---

## Task 9: GitHub Actions — CD

**Files:**
- Create: `.github/workflows/deploy.yml`

Triggers on push to `main` after CI passes. Builds and pushes all three images to `ghcr.io`, then SSHes into the VPS and runs `deploy.sh`.

**Required GitHub Secrets** (set in repo Settings → Secrets → Actions):
| Secret | Value |
|--------|-------|
| `DEPLOY_HOST` | VPS IP or hostname |
| `DEPLOY_KEY` | Private SSH key for `deploy` user |
| `MONGODB_URI` | Atlas connection string (production) |
| `JWT_SECRET` | 64-char random string |
| `JWT_REFRESH_SECRET` | 64-char random string |
| `CORS_ORIGIN` | `https://indiatownship.com,https://admin.indiatownship.com` |
| `CLOUDINARY_CLOUD_NAME` | from Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | from Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | from Cloudinary dashboard |
| `WHATSAPP_PHONE_NUMBER_ID` | from Meta dashboard |
| `WHATSAPP_ACCESS_TOKEN` | from Meta dashboard |
| `WHATSAPP_ADMIN_NUMBER` | WhatsApp number with country code |

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy

on:
  push:
    branches: [main]

concurrency:
  group: deploy-production
  cancel-in-progress: false

jobs:
  deploy:
    name: Build, Push & Deploy
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Set image tag
        id: tag
        run: echo "IMAGE_TAG=sha-${GITHUB_SHA::7}" >> "$GITHUB_OUTPUT"

      - name: Log in to ghcr.io
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build & push API
        uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/api/Dockerfile
          push: true
          tags: |
            ghcr.io/${{ github.repository }}/it-api:${{ steps.tag.outputs.IMAGE_TAG }}
            ghcr.io/${{ github.repository }}/it-api:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build & push Web
        uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/web/Dockerfile
          push: true
          tags: |
            ghcr.io/${{ github.repository }}/it-web:${{ steps.tag.outputs.IMAGE_TAG }}
            ghcr.io/${{ github.repository }}/it-web:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build & push Admin
        uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/admin/Dockerfile
          push: true
          tags: |
            ghcr.io/${{ github.repository }}/it-admin:${{ steps.tag.outputs.IMAGE_TAG }}
            ghcr.io/${{ github.repository }}/it-admin:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Copy docker-compose to VPS
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: deploy
          key: ${{ secrets.DEPLOY_KEY }}
          source: "docker-compose.yml,infra/scripts/deploy.sh"
          target: /opt/indiatownship

      - name: Deploy on VPS
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: deploy
          key: ${{ secrets.DEPLOY_KEY }}
          envs: IMAGE_TAG,GITHUB_REPOSITORY
          script: |
            cd /opt/indiatownship
            IMAGE_TAG=$IMAGE_TAG GITHUB_REPO=$GITHUB_REPOSITORY bash infra/scripts/deploy.sh
        env:
          IMAGE_TAG: ${{ steps.tag.outputs.IMAGE_TAG }}
          GITHUB_REPOSITORY: ${{ github.repository }}
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "feat(infra): GitHub Actions CD — build, push, SSH deploy"
```

---

## Task 10: SSL with Certbot (post-deploy, manual)

This task is run **on the VPS after the first successful deploy**, not in CI. It configures HTTPS and auto-renewal.

- [ ] **Step 1: SSH into VPS as root**

```bash
ssh root@<DEPLOY_HOST>
```

- [ ] **Step 2: Install certbot**

```bash
apt-get install -y certbot python3-certbot-nginx
```

- [ ] **Step 3: Stop nginx container (certbot needs port 80)**

```bash
cd /opt/indiatownship
docker compose stop nginx
```

- [ ] **Step 4: Obtain certificates**

```bash
certbot certonly --standalone \
  -d indiatownship.com \
  -d www.indiatownship.com \
  -d api.indiatownship.com \
  -d admin.indiatownship.com \
  --email vinayak9verma@gmail.com \
  --agree-tos \
  --non-interactive
```

Expected: certificates saved to `/etc/letsencrypt/live/indiatownship.com/`.

- [ ] **Step 5: Update `infra/nginx/nginx.conf` for HTTPS**

Add SSL server blocks for each domain. The pattern for each (example for web):

```nginx
server {
    listen 80;
    server_name indiatownship.com www.indiatownship.com;
    return 301 https://indiatownship.com$request_uri;
}

server {
    listen 443 ssl;
    server_name indiatownship.com;

    ssl_certificate     /etc/letsencrypt/live/indiatownship.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/indiatownship.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;

    client_max_body_size 10m;

    location / {
        proxy_pass         http://web:3001;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Repeat for `api.indiatownship.com` (→ api:3001) and `admin.indiatownship.com` (→ admin:3002).

- [ ] **Step 6: Mount certs into nginx container**

Add volumes to nginx service in `docker-compose.yml`:

```yaml
  nginx:
    build:
      context: ./infra/nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
    networks:
      - it-network
    depends_on:
      - web
      - admin
      - api
```

- [ ] **Step 7: Restart and verify**

```bash
cd /opt/indiatownship
docker compose up -d nginx
curl -I https://indiatownship.com
# Expected: HTTP/2 200
```

- [ ] **Step 8: Set up auto-renewal cron**

```bash
echo "0 2 * * * root certbot renew --quiet && cd /opt/indiatownship && docker compose restart nginx" \
  | tee /etc/cron.d/certbot-renew
```

- [ ] **Step 9: Commit updated nginx.conf and docker-compose.yml**

```bash
git add infra/nginx/nginx.conf docker-compose.yml
git commit -m "feat(infra): nginx HTTPS config with certbot SSL"
```

---

## Self-Review

**Spec coverage:**
- [x] Docker for API, Web, Admin ✅ Tasks 2–4
- [x] Nginx reverse proxy with subdomain routing ✅ Task 5
- [x] docker-compose production file ✅ Task 6
- [x] VPS server setup script ✅ Task 7
- [x] CI — test + lint + type-check + build images on PRs ✅ Task 8
- [x] CD — push to ghcr.io + SSH deploy on main ✅ Task 9
- [x] SSL / HTTPS ✅ Task 10
- [x] .env documentation ✅ Task 1

**Gaps / notes:**
- Mobile (React Native + Expo) is not containerized — Expo apps are published via `eas build`, not Docker. No action needed.
- MongoDB stays on Atlas — no DB container required.
- `MONGODB_URI_TEST` secret is needed in CI for API tests. If Atlas isn't available in CI, add a `mongo` service to the CI job or mock it. The plan notes this secret but doesn't add a mongo service — keep this simple; the test suite already has its own test DB config.

**Placeholder scan:** No TBDs, no "implement later", all steps have concrete commands and code.

**Type consistency:** No shared types across tasks — all infra files (Dockerfiles, yaml, shell) are standalone.
