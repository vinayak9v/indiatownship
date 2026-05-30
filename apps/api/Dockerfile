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

# Copy node_modules (contains workspace symlink: @indiatownship/types -> ../../packages/types)
COPY --from=builder /app/node_modules ./node_modules

# Copy types package with compiled dist so the workspace symlink resolves at runtime
# The symlink at node_modules/@indiatownship/types points to ../../packages/types
# which resolves to /app/packages/types — so we must populate that path
COPY --from=builder /app/packages/types/dist ./packages/types/dist

# Patch types package.json so Node resolves 'main' to compiled JS (not .ts)
RUN printf '{"name":"@indiatownship/types","version":"0.0.1","main":"./dist/index.js","types":"./dist/index.d.ts"}' \
    > ./packages/types/package.json

EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "dist/index.js"]
