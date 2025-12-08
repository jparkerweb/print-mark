# Build arguments
ARG VERSION=1.0.0

# =============================================================================
# Stage 1: Base - Node.js 22 Alpine
# =============================================================================
FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
ENV NODE_ENV=production

# =============================================================================
# Stage 2: Dependencies - Install production dependencies only
# =============================================================================
FROM base AS deps
RUN npm ci --only=production --ignore-scripts

# =============================================================================
# Stage 3: Build - Install all deps and build application
# =============================================================================
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# =============================================================================
# Stage 4: Production - Final optimized image
# =============================================================================
FROM node:22-alpine AS production

# Build argument for version
ARG VERSION=1.0.0

# Labels
LABEL version=$VERSION
LABEL maintainer="print-mark"
LABEL description="Markdown to PDF converter with print-optimized themes"

# Install Chromium and dependencies for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# Set Puppeteer environment variables to use system Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Set app environment variables
ENV NODE_ENV=production
ENV VERSION=$VERSION
ENV HOST=0.0.0.0
ENV PORT=3000

# Create app directory
WORKDIR /app

# Copy production dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Copy package.json for version info
COPY package.json ./

# Create non-root user for security
RUN adduser -D -s /bin/sh appuser \
    && chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "dist/server/index.js"]
