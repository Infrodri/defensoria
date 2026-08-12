FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json turbo.json ./
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

RUN npm ci
RUN npm run build --workspace=@defensoria/shared
RUN npm run build --workspace=@defensoria/web

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3100

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3100

CMD ["node", "apps/web/server.js"]
