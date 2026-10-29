FROM node:24-bookworm-slim AS deps
WORKDIR /workspace
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY apps/frontend/package.json ./apps/frontend/package.json
COPY apps/backend/package.json ./apps/backend/package.json
RUN npm ci --workspace @company-creator/backend --include-workspace-root

FROM deps AS test
COPY apps/backend ./apps/backend
RUN npm run prisma:generate --workspace @company-creator/backend

FROM test AS builder
RUN npm run build --workspace @company-creator/backend

FROM node:24-bookworm-slim AS runner
WORKDIR /workspace
ENV NODE_ENV=production
ENV PORT=4000
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs backend \
  && mkdir -p /app/data/sites /app/data/settings /app/data/photos \
  && chown -R backend:nodejs /app/data
COPY --from=builder --chown=backend:nodejs /workspace/package.json /workspace/package-lock.json ./
COPY --from=builder --chown=backend:nodejs /workspace/node_modules ./node_modules
COPY --from=builder --chown=backend:nodejs /workspace/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder --chown=backend:nodejs /workspace/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder --chown=backend:nodejs /workspace/apps/backend/dist ./apps/backend/dist
COPY --from=builder --chown=backend:nodejs /workspace/apps/backend/prisma ./apps/backend/prisma
COPY --from=builder --chown=backend:nodejs /workspace/apps/backend/prisma.config.ts ./apps/backend/prisma.config.ts
COPY --from=builder --chown=backend:nodejs /workspace/apps/backend/assets ./apps/backend/assets
USER backend
EXPOSE 4000
CMD ["sh", "-c", "npm run prisma:deploy --workspace @company-creator/backend && npm run start:prod --workspace @company-creator/backend"]
