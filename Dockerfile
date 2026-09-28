# ==========================================
# SAAHAJ Health Intelligence Production Image
# Multi-stage lightweight OCI container
# ==========================================

# 1. Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# 2. Production Runtime Stage
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Add security non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 saahaj

# Copy built application and package manifest
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/server ./server

# Set ownership to unprivileged user
USER saahaj

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health/live || exit 1

CMD ["npm", "run", "start"]
