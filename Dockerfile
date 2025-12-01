# Multi-stage build for production Next.js app
FROM node:20-bookworm AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy code & build
COPY . .
RUN npm run build

# Production image
FROM node:20-bookworm-slim AS runner
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

# Ensure data directory exists for SQLite database
RUN mkdir -p /app/data

EXPOSE 3000
ENV NODE_ENV=production

# default command (can be overridden by docker-compose)
CMD ["npm", "run", "start"]
