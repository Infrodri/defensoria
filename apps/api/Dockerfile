FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json turbo.json ./
COPY packages/shared ./packages/shared
COPY packages/db ./packages/db
COPY apps/api ./apps/api

RUN npm ci
RUN npm run db:generate
RUN npm run build --workspace=@defensoria/shared
RUN npm run build --workspace=@defensoria/api

FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache postgresql-client

ENV NODE_ENV=production
ENV PORT=4100

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/packages/db ./packages/db
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

EXPOSE 4100

CMD ["node", "apps/api/dist/apps/api/src/main.js"]
