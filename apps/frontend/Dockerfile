FROM node:24-bookworm-slim AS deps
WORKDIR /workspace
COPY package.json package-lock.json ./
COPY apps/frontend/package.json ./apps/frontend/package.json
COPY apps/backend/package.json ./apps/backend/package.json
RUN npm ci --workspace @company-creator/frontend --include-workspace-root

FROM deps AS test
COPY apps/frontend ./apps/frontend

FROM deps AS builder
ARG NEXT_PUBLIC_API_URL=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
COPY apps/frontend ./apps/frontend
RUN npm run build --workspace @company-creator/frontend

FROM node:24-bookworm-slim AS runner
WORKDIR /workspace
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=builder --chown=nextjs:nodejs /workspace/package.json /workspace/package-lock.json ./
COPY --from=builder --chown=nextjs:nodejs /workspace/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/frontend/package.json ./apps/frontend/package.json
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/frontend/.next ./apps/frontend/.next
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/frontend/public ./apps/frontend/public
USER nextjs
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "@company-creator/frontend"]
