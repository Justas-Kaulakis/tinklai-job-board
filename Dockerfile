# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S -G nodejs -u 1001 nextjs

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/src/lib/db ./src/lib/db
COPY --from=builder /app/docker ./docker

RUN chmod +x ./docker/entrypoint.sh

USER nextjs

EXPOSE 3000

ENTRYPOINT ["./docker/entrypoint.sh"]
CMD ["npm", "run", "start"]
