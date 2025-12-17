# Dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN \
  if [ -f package-lock.json ]; then npm ci --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Prune node_modules to keep only production dependencies
FROM node:22-alpine AS prod-deps
ENV NODE_ENV production
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --frozen-lockfile --production --ignore-scripts && npm cache clean --force

# Lightweight cleanup stage to remove unnecessary files
FROM alpine:3.22 AS cleanup
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules

# Remove unnecessary files from node_modules to reduce size
RUN find ./node_modules -type d -name "*.d.ts" -exec rm -rf {} + 2>/dev/null || true && \
    find ./node_modules -type f \( -name "*.md" -o -name "*.txt" -o -name "LICENSE*" -o -name "*.map" -o -name "*.json" \) -delete && \
    find ./node_modules -type d \( -name "test" -o -name "tests" -o -name "__tests__" -o -name "spec" -o -name ".github" -o -name "docs" -o -name "examples" \) -exec rm -rf {} + 2>/dev/null || true && \
    find ./node_modules -type f \( -name "*.ts" -o -name "*.jsx" -o -name "*.mjs" \) ! -path "*/node_modules/.bin/*" -delete 2>/dev/null || true && \
    find ./node_modules/@ckeditor -type f \( -name "*.map" -o -name "*.ts" -o -name "*.jsx" \) -delete 2>/dev/null || true && \
    find ./node_modules -type d -name "node_modules" ! -path "./node_modules" -exec rm -rf {} + 2>/dev/null || true

# Runner - ultra minimal production image based on Alpine
FROM alpine:3.22 AS runner
WORKDIR /app

ENV NODE_ENV="production"
ENV NEXT_TELEMETRY_DISABLED=1

# Install only Node.js (minimal runtime, no npm)
RUN apk add --no-cache nodejs

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy cleaned node_modules
COPY --from=cleanup --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy only essential build outputs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/src/messages ./src/messages

# Strip unnecessary files
RUN rm -rf /usr/share/man/* /var/cache/apk/* /tmp/* 2>/dev/null || true

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]