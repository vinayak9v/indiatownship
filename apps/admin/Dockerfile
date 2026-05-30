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

# Patch types package.json so Next.js resolves 'main' to compiled JS (not .ts)
RUN printf '{"name":"@indiatownship/types","version":"0.0.1","main":"./dist/index.js","types":"./dist/index.d.ts"}' \
    > ./packages/types/package.json

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

USER nextjs
EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3002/ || exit 1

CMD ["node", "apps/admin/server.js"]
