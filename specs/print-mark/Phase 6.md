# Phase 6: Docker & Deployment

**Status:** Not Started
**Estimated Tasks:** 20 tasks

## Overview

This phase containerizes the application for production deployment. It includes creating an optimized multi-stage Dockerfile, configuring Puppeteer for Docker, creating docker-compose for local development, and setting up GitHub Actions for automated Docker image builds and publishing.

## Prerequisites

- [ ] Phase 5 must be complete (PDF generation works)
- [ ] Application runs correctly with `npm run build && npm start`
- [ ] GitHub repository exists (for Actions workflow)

## Tasks

### Docker Ignore

- [ ] **Task 6.1:** Create `.dockerignore` file
  - File: `.dockerignore`
  - Ignore:
    ```
    node_modules
    dist
    .git
    .gitignore
    .env
    .env.*
    *.md
    specs/
    .github/
    .vscode/
    *.log
    .DS_Store
    Thumbs.db
    ```
  - Keep `README.md` and `package*.json`

### Dockerfile

- [ ] **Task 6.2:** Create multi-stage Dockerfile - base stage
  - File: `Dockerfile`
  - Stage 1: `base` - Node.js 22 Alpine
  - Set working directory to `/app`
  - Copy `package.json` and `package-lock.json`
  - Set `NODE_ENV=production`

- [ ] **Task 6.3:** Create Dockerfile - dependencies stage
  - In `Dockerfile`
  - Stage 2: `deps` - Install production dependencies
  - Run `npm ci --only=production`
  - Creates minimal node_modules for production

- [ ] **Task 6.4:** Create Dockerfile - build stage
  - In `Dockerfile`
  - Stage 3: `build` - Build application
  - Copy all source files
  - Install all dependencies (including dev)
  - Run `npm run build`
  - Output: `dist/` folder

- [ ] **Task 6.5:** Create Dockerfile - production stage
  - In `Dockerfile`
  - Stage 4: `production` - Final image
  - Use `node:22-alpine` as base
  - Install Chromium and dependencies for Puppeteer:
    ```dockerfile
    RUN apk add --no-cache \
        chromium \
        nss \
        freetype \
        harfbuzz \
        ca-certificates \
        ttf-freefont
    ```
  - Set Puppeteer environment variables:
    ```dockerfile
    ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
    ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
    ```

- [ ] **Task 6.6:** Complete Dockerfile production stage
  - In `Dockerfile`
  - Copy node_modules from `deps` stage
  - Copy dist from `build` stage
  - Copy package.json for version info
  - Create non-root user: `adduser -D appuser`
  - Switch to non-root user
  - Expose port 3000
  - Set healthcheck: `CMD wget -q --spider http://localhost:3000/api/health || exit 1`
  - Set CMD: `["node", "dist/server/index.js"]`

- [ ] **Task 6.7:** Add build ARG for version
  - In `Dockerfile`
  - Add `ARG VERSION=1.0.0`
  - Set `ENV VERSION=$VERSION`
  - Label with version: `LABEL version=$VERSION`

### Puppeteer Docker Configuration

- [ ] **Task 6.8:** Update PDF service for Docker compatibility
  - File: `src/server/services/pdf.ts`
  - Check for `PUPPETEER_EXECUTABLE_PATH` environment variable
  - Use system Chromium if env var is set
  - Add additional sandbox args for Docker:
    ```typescript
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
    ```

- [ ] **Task 6.9:** Update server config for Docker
  - File: `src/server/config.ts`
  - Add `PUPPETEER_EXECUTABLE_PATH` to config schema (optional string)
  - Export for use in PDF service

### Docker Compose

- [ ] **Task 6.10:** Create docker-compose.yml
  - File: `docker-compose.yml`
  - Service: `print-mark`
  - Build from local Dockerfile
  - Port mapping: `3000:3000`
  - Environment variables from `.env` file
  - Restart policy: `unless-stopped`
  - Health check configuration

- [ ] **Task 6.11:** Create docker-compose.override.yml for development
  - File: `docker-compose.override.yml`
  - Mount source code as volume for development
  - Set `NODE_ENV=development`
  - Expose additional debugging ports if needed

### GitHub Actions Workflow

- [ ] **Task 6.12:** Create GitHub Actions workflow directory
  - Create: `.github/workflows/`

- [ ] **Task 6.13:** Create Docker build workflow
  - File: `.github/workflows/docker-publish.yml`
  - Trigger on:
    - Release published
    - Tags matching `v*.*.*`
    - Manual workflow_dispatch
  - Set permissions: `contents: read`, `packages: write`

- [ ] **Task 6.14:** Add checkout and Docker setup steps
  - In `.github/workflows/docker-publish.yml`
  - Step: Checkout repository using `actions/checkout@v4`
  - Step: Set up Docker Buildx using `docker/setup-buildx-action@v3`

- [ ] **Task 6.15:** Add registry login steps
  - In `.github/workflows/docker-publish.yml`
  - Step: Login to GitHub Container Registry
    - Registry: `ghcr.io`
    - Username: `${{ github.actor }}`
    - Password: `${{ secrets.GITHUB_TOKEN }}`
  - Step: Login to Docker Hub (optional, for dual publishing)
    - Uses secrets: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`

- [ ] **Task 6.16:** Add metadata extraction step
  - In `.github/workflows/docker-publish.yml`
  - Step: Extract metadata using `docker/metadata-action@v5`
  - Generate tags:
    - `latest` for default branch
    - Semver: `{{version}}`, `{{major}}.{{minor}}`, `{{major}}`

- [ ] **Task 6.17:** Add build and push step
  - In `.github/workflows/docker-publish.yml`
  - Step: Build and push using `docker/build-push-action@v5`
  - Enable build cache: `cache-from: type=gha`, `cache-to: type=gha,mode=max`
  - Pass VERSION build arg

### Testing Docker Build

- [ ] **Task 6.18:** Create Docker build test script
  - File: `scripts/docker-test.sh` (or document in README)
  - Build image locally: `docker build -t print-mark:test .`
  - Run container: `docker run -p 3000:3000 print-mark:test`
  - Test health endpoint: `curl http://localhost:3000/api/health`
  - Test PDF generation via curl

- [ ] **Task 6.19:** Verify Docker image size
  - Build image and check size: `docker images print-mark:test`
  - Target: < 500MB
  - If larger, investigate optimizations:
    - Remove unnecessary packages
    - Clean up package manager cache
    - Verify multi-stage build is working

### Verification

- [ ] **Task 6.20:** Full Docker verification
  - Build Docker image: `docker build -t print-mark:test .`
  - Run container: `docker run -d -p 3000:3000 --name print-mark-test print-mark:test`
  - Wait for health check: `docker inspect --format='{{.State.Health.Status}}' print-mark-test`
  - Test endpoints:
    - `curl http://localhost:3000/api/health` → healthy
    - `curl http://localhost:3000/api/themes` → returns themes
    - Load UI in browser → application works
    - Generate PDF → downloads successfully
  - Check logs: `docker logs print-mark-test`
  - Stop and remove: `docker stop print-mark-test && docker rm print-mark-test`
  - Verify GitHub Actions workflow syntax: `act -n` (if using act locally)

## Acceptance Criteria

- [ ] Docker image builds successfully
- [ ] Image size is under 500MB
- [ ] Container starts in under 5 seconds
- [ ] Health check passes
- [ ] All API endpoints work in container
- [ ] PDF generation works in container (Puppeteer/Chromium functional)
- [ ] Application runs as non-root user
- [ ] docker-compose up starts the application correctly
- [ ] GitHub Actions workflow is valid YAML
- [ ] Multi-stage build produces optimized image

## Notes

- Alpine Linux requires different packages than Debian for Chromium
- The `--no-sandbox` flag is required when running Chromium as non-root
- `--disable-dev-shm-usage` helps prevent crashes in limited-memory containers
- GitHub Container Registry (ghcr.io) is free for public repositories
- Docker Hub integration is optional; remove those steps if not needed
- Consider adding vulnerability scanning step to CI workflow

---

## Phase Completion Summary

_[To be filled after implementation]_

**Completed:** [Date]
**Implemented by:** [AI model/human]

### What was done:

[Brief summary]

### Files created/modified:

- [List files]

### Issues encountered:

[Any blockers or deviations from spec - or "None"]
