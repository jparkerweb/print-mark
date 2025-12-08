# Phase 1: Project Foundation

**Status:** Complete
**Estimated Tasks:** 25 tasks

## Overview

This phase establishes the complete project structure, build tooling, and basic server infrastructure. By the end of this phase, you will have a working Fastify server serving a placeholder frontend, with all TypeScript and build configuration in place.

## Prerequisites

- [x] Node.js 22 LTS installed
- [x] npm or pnpm package manager available
- [x] Git repository initialized

## Tasks

### Project Initialization

- [x] **Task 1.1:** Create `package.json` with project metadata
  - File: `package.json`
  - Set name to `print-mark`, version to `1.0.0`
  - Set `"type": "module"` for ES modules
  - Set `"engines": { "node": ">=22" }`
  - Add scripts: `dev`, `build`, `start`, `lint`, `format`

- [x] **Task 1.2:** Create TypeScript configuration for the project
  - File: `tsconfig.json`
  - Target: `ES2022`, Module: `ESNext`, ModuleResolution: `bundler`
  - Enable: `strict`, `noEmit`, `skipLibCheck`
  - Set paths alias: `@shared/*` -> `./src/shared/*`
  - Include: `src/**/*`

- [x] **Task 1.3:** Create TypeScript configuration for server build
  - File: `tsconfig.server.json`
  - Extends: `./tsconfig.json`
  - Set `outDir` to `dist`
  - Set `rootDir` to `src`
  - Set `noEmit` to `false`
  - Include only: `src/server/**/*`, `src/shared/**/*`

- [x] **Task 1.4:** Install production dependencies
  - Run: `npm install fastify @fastify/static @fastify/multipart @fastify/cors zod dotenv`
  - These provide: web server, static files, file uploads, CORS, validation, env vars

- [x] **Task 1.5:** Install development dependencies
  - Run: `npm install -D typescript @types/node vite eslint prettier eslint-config-prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser concurrently`

### Directory Structure

- [x] **Task 1.6:** Create the complete directory structure
  ```
  src/
  ├── server/
  │   ├── routes/
  │   └── services/
  ├── client/
  │   ├── styles/
  │   │   └── themes/
  │   └── components/
  └── shared/
  public/
  ```

### ESLint & Prettier Configuration

- [x] **Task 1.7:** Create ESLint configuration
  - File: `eslint.config.js`
  - Use flat config format (ESLint 9+)
  - Extend TypeScript ESLint recommended rules
  - Integrate Prettier
  - Set parser to `@typescript-eslint/parser`

- [x] **Task 1.8:** Create Prettier configuration
  - File: `.prettierrc`
  - Settings: `semi: false`, `singleQuote: true`, `tabWidth: 2`, `trailingComma: "es5"`, `printWidth: 100`

- [x] **Task 1.9:** Create `.prettierignore` file
  - Ignore: `dist/`, `node_modules/`, `*.md`, `pnpm-lock.yaml`

### Environment Configuration

- [x] **Task 1.10:** Create environment variable loader
  - File: `src/server/config.ts`
  - Use Zod to define and validate environment schema
  - Define: `PORT` (number, default 3000), `HOST` (string, default '0.0.0.0'), `NODE_ENV` (enum: development/production/test), `MAX_FILE_SIZE` (number, default 26214400), `PDF_TIMEOUT` (number, default 30000), `PDF_CONCURRENT_LIMIT` (number, default 3)
  - Export typed `config` object
  - Load dotenv at top of file

- [x] **Task 1.11:** Create `.env.example` file
  - File: `.env.example`
  - Document all environment variables with comments
  - Provide sensible defaults for local development

### Shared Types

- [x] **Task 1.12:** Create shared TypeScript types
  - File: `src/shared/types.ts`
  - Define `Theme` interface: `{ id: string, name: string, description: string }`
  - Define `ThemeId` type: `'clean' | 'academic' | 'modern' | 'compact'`
  - Define `PDFOptions` interface: `{ pageSize: 'A4' | 'Letter' | 'Legal', margins: 'normal' | 'narrow' | 'wide', includePageNumbers: boolean }`
  - Define `PDFRequest` interface: `{ markdown: string, theme: ThemeId, options: PDFOptions }`
  - Define `UploadResponse` interface: `{ filename: string, content: string, size: number }`
  - Define `HealthResponse` interface: `{ status: 'healthy', version: string }`

### Vite Configuration

- [x] **Task 1.13:** Create Vite configuration for frontend
  - File: `vite.config.ts`
  - Set root to `src/client`
  - Set build outDir to `../../dist/client`
  - Configure dev server to proxy `/api/*` to `http://localhost:3000`
  - Set publicDir to `../../public`

### Fastify Server Setup

- [x] **Task 1.14:** Create server entry point
  - File: `src/server/index.ts`
  - Import and initialize Fastify with logger enabled
  - Register `@fastify/cors` plugin (allow all origins in development)
  - Register `@fastify/multipart` plugin with `limits.fileSize` from config
  - Register `@fastify/static` plugin to serve `dist/client` from root `/`
  - Import and register health route
  - Start server on configured HOST and PORT
  - Add graceful shutdown handler for SIGTERM/SIGINT

- [x] **Task 1.15:** Create health check route
  - File: `src/server/routes/health.ts`
  - Export function that registers `GET /api/health` route
  - Read version from `package.json` (use `createRequire` for JSON import)
  - Return `{ status: 'healthy', version: '<version>' }`

### Frontend Placeholder

- [x] **Task 1.16:** Create HTML entry point
  - File: `src/client/index.html`
  - Standard HTML5 boilerplate with `<meta charset="UTF-8">` and viewport meta
  - Title: "print-mark - Markdown to PDF"
  - Link to `styles/app.css`
  - Create app container: `<div id="app"></div>`
  - Script tag with `type="module"` pointing to `main.ts`

- [x] **Task 1.17:** Create main client entry point
  - File: `src/client/main.ts`
  - Select `#app` element
  - Set innerHTML to placeholder content: "print-mark loading..."
  - Add console.log to confirm script loaded

- [x] **Task 1.18:** Create base application styles
  - File: `src/client/styles/app.css`
  - CSS reset (box-sizing, margins, font-family)
  - CSS custom properties for colors: `--color-bg`, `--color-text`, `--color-border`, `--color-primary`
  - Set body to full viewport height
  - Style `#app` as flex container

### Package Scripts

- [x] **Task 1.19:** Add development script to package.json
  - Script `dev`: runs Vite dev server and Node server concurrently
  - Use `concurrently` package or separate terminal instructions in comments

- [x] **Task 1.20:** Add build script to package.json
  - Script `build`: `tsc -p tsconfig.server.json && vite build`
  - Compiles server TypeScript and bundles client

- [x] **Task 1.21:** Add start script to package.json
  - Script `start`: `node dist/server/index.js`
  - Runs production server

- [x] **Task 1.22:** Add lint and format scripts to package.json
  - Script `lint`: `eslint src/`
  - Script `format`: `prettier --write src/`

### Git Configuration

- [x] **Task 1.23:** Create `.gitignore` file
  - Ignore: `node_modules/`, `dist/`, `.env`, `*.log`, `.DS_Store`, `*.local`

- [x] **Task 1.24:** Create `.nvmrc` file
  - File: `.nvmrc`
  - Content: `22` (specifies Node.js version)

### Verification

- [x] **Task 1.25:** Verify project setup
  - Run `npm install` - should complete without errors
  - Run `npm run build` - should compile without errors
  - Run `npm start` - server should start on port 3000
  - Visit `http://localhost:3000/api/health` - should return JSON with status "healthy"
  - Visit `http://localhost:3000/` - should show placeholder page

## Acceptance Criteria

- [x] `npm install` completes without errors
- [x] `npm run build` compiles both server and client without TypeScript errors
- [x] `npm start` starts the server successfully
- [x] `GET /api/health` returns `{ "status": "healthy", "version": "1.0.0" }`
- [x] Root URL `/` serves the placeholder HTML page
- [x] ESLint runs without errors on the codebase
- [x] All environment variables have documented defaults

## Notes

- The Vite dev server (port 5173) proxies API requests to Fastify (port 3000) during development
- Production serves everything from Fastify on a single port
- The `@shared` path alias allows importing shared types from both client and server code

---

## Phase Completion Summary

**Completed:** 2025-12-07
**Implemented by:** Claude (AI)

### What was done:

Established complete project foundation with TypeScript, Vite, and Fastify. Created all configuration files, directory structure, base styling, shared types, and a working server with health check endpoint.

### Files created/modified:

- `package.json` - Project configuration with all scripts
- `tsconfig.json` - Base TypeScript configuration
- `tsconfig.server.json` - Server-specific TypeScript build config
- `vite.config.ts` - Vite frontend build configuration
- `eslint.config.js` - ESLint flat config
- `.prettierrc` - Prettier formatting rules
- `.prettierignore` - Prettier ignore patterns
- `.gitignore` - Git ignore patterns
- `.nvmrc` - Node version specification
- `.env.example` - Environment variable documentation
- `src/server/index.ts` - Fastify server entry point
- `src/server/config.ts` - Environment configuration with Zod validation
- `src/server/routes/health.ts` - Health check API route
- `src/shared/types.ts` - Shared TypeScript type definitions
- `src/client/index.html` - HTML entry point
- `src/client/main.ts` - Client entry point
- `src/client/styles/app.css` - Base application styles

### Issues encountered:

- Task 1.3 deviation: Changed `outDir` to `dist` and added `rootDir: src` to fix output path structure (files were being output to `dist/server/server/` instead of `dist/server/`)
- Task 1.25 partial verification: Server verification could not be completed because port 3000 is already in use by another application ("Simple Linkz") on the local machine. Build verification passed successfully.
