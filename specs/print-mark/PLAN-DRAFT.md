# print-mark - Implementation Plan

**Created:** 2025-12-07
**Status:** Complete
**Confidence:** 92% (Requirements: 25/25, Feasibility: 24/25, Integration: 22/25, Risk: 21/25)

## 1. Executive Summary

**print-mark** is a web application that converts Markdown to clean, printable HTML with PDF export capabilities. Users can upload or paste Markdown content, preview it in real-time with selectable themes, and export to PDF with page numbers. The application is stateless, requires no authentication, and is deployable via Docker.

## 2. Requirements

### 2.1 Functional Requirements

- [ ] FR-1: Users can **upload** markdown files (.md, up to 25MB)
- [ ] FR-2: Users can **paste** markdown text directly into the editor
- [ ] FR-3: Application converts markdown (GFM) to **sanitized HTML**
- [ ] FR-4: Users can **preview** rendered HTML in real-time as they type
- [ ] FR-5: Users can select from **multiple print themes** (Clean, Academic, Modern, Compact)
- [ ] FR-6: Users can **export to PDF** with page numbers (server-side generation)
- [ ] FR-7: Users can **print directly** from browser
- [ ] FR-8: Users can **copy HTML** output to clipboard
- [ ] FR-9: **CI/CD Pipeline**: GitHub Actions workflow to build and publish Docker images

### 2.2 Non-Functional Requirements

- [ ] NFR-1: Markdown conversion completes in <500ms for typical documents
- [ ] NFR-2: PDF generation completes in <10 seconds for documents up to 100KB
- [ ] NFR-3: HTML output is sanitized to prevent XSS attacks
- [ ] NFR-4: Application supports Chrome, Firefox, Safari, Edge (latest 2 versions)
- [ ] NFR-5: Docker image size <500MB
- [ ] NFR-6: Application starts in <5 seconds
- [ ] NFR-7: Port configurable via environment variable
- [ ] NFR-8: No built-in SSL (designed for reverse proxy deployment)

### 2.3 Out of Scope

- User authentication/accounts
- Document storage/persistence (stateless)
- Image file uploads (only external URLs and base64)
- Batch/multi-document processing
- Dark mode UI
- Built-in SSL/HTTPS termination
- Collaborative editing
- Mobile-native apps

## 3. Tech Stack

| Category | Technology | Version | Justification |
|----------|------------|---------|---------------|
| **Runtime** | Node.js | 22 LTS | Latest LTS, best performance |
| **Backend Framework** | Fastify | 5.x | Faster than Express, excellent plugins, TypeScript support |
| **Markdown Parser** | markdown-it | 14.x | Extensible, excellent GFM plugin ecosystem |
| **Syntax Highlighting** | Shiki | 1.x | VS Code-quality highlighting, server-side |
| **PDF Generation** | Puppeteer | 23.x | Mature, excellent PDF APIs with headers/footers |
| **HTML Sanitization** | DOMPurify | 3.x | Industry standard XSS prevention |
| **Validation** | Zod | 3.x | TypeScript-first runtime validation |
| **Build Tool** | Vite | 6.x | Fast HMR, modern ESM |
| **Language** | TypeScript | 5.x | Type safety, better DX |
| **Code Editor** | CodeMirror | 6.x | Lightweight, modern, markdown mode |
| **Styling** | Vanilla CSS | Modern | Native nesting, variables, no build complexity |
| **Docker Base** | node:22-alpine | latest | Smallest image size |

### Dependencies

**Production:**
```
fastify, @fastify/static, @fastify/multipart, @fastify/cors
markdown-it, markdown-it-anchor, markdown-it-task-lists, markdown-it-footnote
shiki, puppeteer, dompurify, jsdom, zod, dotenv
```

**Development:**
```
typescript, vite, @types/node, @types/dompurify
@codemirror/state, @codemirror/view, @codemirror/lang-markdown
eslint, prettier
```

## 4. Architecture

### 4.1 Architecture Pattern

**Hybrid Client-Server Architecture**

- Client-side markdown rendering for instant live preview (zero network latency)
- Server-side markdown rendering for PDF generation (consistent output)
- Shared markdown-it configuration ensures preview matches PDF output

### 4.2 System Context Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SYSTEMS                              │
└─────────────────────────────────────────────────────────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
        ▼                          ▼                          ▼
┌───────────────┐        ┌─────────────────┐        ┌─────────────────┐
│    Browser    │        │  Reverse Proxy  │        │  Docker Host    │
│   (Client)    │        │ (nginx/traefik) │        │    Runtime      │
└───────────────┘        └─────────────────┘        └─────────────────┘
        │                         │                          │
        └─────────────────────────┼──────────────────────────┘
                                  │
                                  ▼
        ┌─────────────────────────────────────────────────────┐
        │                   PRINT-MARK APP                     │
        │  ┌─────────────────────────────────────────────────┐ │
        │  │                 Node.js Server                  │ │
        │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────┐  │ │
        │  │  │   Static    │  │  Markdown   │  │   PDF   │  │ │
        │  │  │   Server    │  │  Converter  │  │ Engine  │  │ │
        │  │  └─────────────┘  └─────────────┘  └─────────┘  │ │
        │  └─────────────────────────────────────────────────┘ │
        │  ┌─────────────────────────────────────────────────┐ │
        │  │              Frontend SPA                       │ │
        │  │  ┌─────────┐  ┌──────────┐  ┌───────────────┐   │ │
        │  │  │ Editor  │  │ Preview  │  │ Theme Picker  │   │ │
        │  │  └─────────┘  └──────────┘  └───────────────┘   │ │
        │  └─────────────────────────────────────────────────┘ │
        └─────────────────────────────────────────────────────┘
```

### 4.3 Component Overview

| Component | Responsibility | Dependencies |
|-----------|----------------|--------------|
| **Editor Panel** | Markdown text editing with syntax highlighting | CodeMirror |
| **Preview Panel** | Display rendered HTML with theme styling | ThemeService, MarkdownService |
| **Toolbar** | Action buttons, file upload, theme picker | - |
| **MarkdownService (Client)** | Convert markdown to HTML in browser | markdown-it |
| **MarkdownService (Server)** | Convert markdown to HTML for PDF | markdown-it, Shiki |
| **PDFService** | Generate PDF from HTML with page numbers | Puppeteer |
| **ThemeService** | Manage theme metadata and CSS | Filesystem |
| **Static Server** | Serve frontend assets | @fastify/static |

### 4.4 Data Flow

```
User Input → Editor → MarkdownService (Client) → Preview Panel
                │
                │ [Export PDF]
                ▼
           POST /api/pdf
                │
                ▼
    MarkdownService (Server) → Theme CSS → Puppeteer → PDF Download
```

### 4.5 API Design

#### `GET /api/health`
```json
Response: 200 OK
{
  "status": "healthy",
  "version": "1.0.0"
}
```

#### `GET /api/themes`
```json
Response: 200 OK
{
  "themes": [
    { "id": "clean", "name": "Clean", "description": "Minimal, spacious layout" },
    { "id": "academic", "name": "Academic", "description": "Traditional serif typography" },
    { "id": "modern", "name": "Modern", "description": "Sans-serif with subtle accents" },
    { "id": "compact", "name": "Compact", "description": "Dense layout for reference materials" }
  ]
}
```

#### `POST /api/pdf`
```json
Request:
{
  "markdown": "# Hello World\n\nContent...",
  "theme": "clean",
  "options": {
    "pageSize": "A4",
    "margins": "normal",
    "includePageNumbers": true
  }
}

Response: 200 OK
Content-Type: application/pdf
[PDF binary]
```

#### `POST /api/upload`
```
Request: multipart/form-data (file: .md, max 25MB)

Response: 200 OK
{
  "filename": "document.md",
  "content": "# Markdown content...",
  "size": 1234
}
```

### 4.6 Theme System

Four print-optimized themes:

| Theme | Font | Best For |
|-------|------|----------|
| **Clean** | System sans-serif | General documents, notes |
| **Academic** | Serif (Georgia/Times) | Papers, essays, reports |
| **Modern** | Inter/sans-serif | Technical docs, READMEs |
| **Compact** | Small sans-serif | Reference sheets, checklists |

### 4.7 Environment Variables

```bash
PORT=3000                    # HTTP port (default: 3000)
HOST=0.0.0.0                 # Bind address (default: 0.0.0.0)
NODE_ENV=production          # Environment
MAX_FILE_SIZE=26214400       # Max upload size in bytes (25MB)
PDF_TIMEOUT=30000            # PDF generation timeout in ms
PDF_CONCURRENT_LIMIT=3       # Max concurrent PDF generations
```

## 5. Implementation Phases

### Phase 1: Project Foundation

**Goal:** Set up project structure, build tooling, and basic server
**Dependencies:** None

- [ ] Task 1.1: Initialize Node.js project with TypeScript configuration
- [ ] Task 1.2: Configure Vite for frontend build
- [ ] Task 1.3: Set up Fastify server with static file serving
- [ ] Task 1.4: Create shared TypeScript types and interfaces
- [ ] Task 1.5: Set up ESLint + Prettier configuration
- [ ] Task 1.6: Create environment variable configuration with defaults
- [ ] Task 1.7: Implement `/api/health` endpoint

### Phase 2: Markdown Engine

**Goal:** Implement markdown-to-HTML conversion on both client and server
**Dependencies:** Phase 1

- [ ] Task 2.1: Create shared markdown-it configuration (plugins, options)
- [ ] Task 2.2: Implement server-side MarkdownService with Shiki syntax highlighting
- [ ] Task 2.3: Implement client-side MarkdownService (mirrors server config)
- [ ] Task 2.4: Add HTML sanitization with DOMPurify
- [ ] Task 2.5: Write tests for markdown conversion edge cases

### Phase 3: Theme System

**Goal:** Implement print-optimized CSS themes
**Dependencies:** Phase 2

- [ ] Task 3.1: Create base print stylesheet (`_base.css`)
- [ ] Task 3.2: Implement "Clean" theme
- [ ] Task 3.3: Implement "Academic" theme
- [ ] Task 3.4: Implement "Modern" theme
- [ ] Task 3.5: Implement "Compact" theme
- [ ] Task 3.6: Create ThemeService for loading and listing themes
- [ ] Task 3.7: Implement `GET /api/themes` endpoint

### Phase 4: Frontend Application

**Goal:** Build the complete user interface
**Dependencies:** Phase 2, Phase 3

- [ ] Task 4.1: Create application shell and layout (split-pane editor/preview)
- [ ] Task 4.2: Integrate CodeMirror 6 with markdown syntax highlighting
- [ ] Task 4.3: Implement live preview panel with theme application
- [ ] Task 4.4: Build toolbar with theme picker dropdown
- [ ] Task 4.5: Implement file upload handler (drag-drop + button)
- [ ] Task 4.6: Add "Copy HTML" functionality
- [ ] Task 4.7: Add "Print" button (browser print dialog)
- [ ] Task 4.8: Implement responsive layout for smaller screens
- [ ] Task 4.9: Add loading states and error handling UI

### Phase 5: PDF Generation

**Goal:** Implement server-side PDF export with Puppeteer
**Dependencies:** Phase 3, Phase 4

- [ ] Task 5.1: Set up Puppeteer with appropriate configuration
- [ ] Task 5.2: Create PDFService with HTML-to-PDF conversion
- [ ] Task 5.3: Implement page numbering in PDF footer
- [ ] Task 5.4: Add page size options (A4, Letter, Legal)
- [ ] Task 5.5: Add margin presets (normal, narrow, wide)
- [ ] Task 5.6: Implement `POST /api/pdf` endpoint with validation
- [ ] Task 5.7: Add timeout and error handling for PDF generation
- [ ] Task 5.8: Connect frontend "Export PDF" button to API
- [ ] Task 5.9: Implement concurrent request limiting

### Phase 6: Docker & Deployment

**Goal:** Containerize application for production deployment
**Dependencies:** Phase 5

- [ ] Task 6.1: Create optimized multi-stage Dockerfile
- [ ] Task 6.2: Configure Puppeteer for Docker (Chrome dependencies)
- [ ] Task 6.3: Create docker-compose.yml for easy local deployment
- [ ] Task 6.4: Add `.dockerignore` for smaller build context
- [ ] Task 6.5: Create `.github/workflows/docker-publish.yml`
- [ ] Task 6.6: Test Docker image builds and runs correctly
- [ ] Task 6.7: Document environment variables in README

### Phase 7: Polish & Documentation

**Goal:** Final polish, testing, and documentation
**Dependencies:** Phase 6

- [ ] Task 7.1: Add sample markdown content for demo
- [ ] Task 7.2: Create comprehensive README with usage instructions
- [ ] Task 7.3: Add `.env.example` file
- [ ] Task 7.4: Final security review (input validation, sanitization)
- [ ] Task 7.5: Performance testing with large documents
- [ ] Task 7.6: Browser compatibility testing
- [ ] Task 7.7: Create CHANGELOG.md

## 6. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Puppeteer in Docker complexity | High | High | Use `puppeteer-core` + install Chrome separately; reference proven Dockerfile patterns |
| Client/server markdown parity | Medium | Medium | Shared config file; automated tests comparing outputs |
| Large file performance (25MB) | Medium | Medium | Implement streaming; test with max-size files; progress indicators |
| PDF generation timeout | Medium | Medium | 30s timeout; user feedback during generation |
| Memory usage with concurrent PDFs | Medium | High | Limit concurrent instances (3); reuse browser instance |
| XSS via malicious markdown | Low | Critical | DOMPurify with strict config; CSP headers |

## 7. Success Criteria

- [ ] Markdown renders identically in preview and PDF output
- [ ] PDF generation completes in <10 seconds for typical documents
- [ ] Application starts in <5 seconds
- [ ] Docker image size <500MB
- [ ] No XSS vulnerabilities (validated with test payloads)
- [ ] Handles 25MB file uploads without crashing
- [ ] Works in Chrome, Firefox, Safari, Edge (latest 2 versions)
- [ ] Lighthouse accessibility score >90
- [ ] GitHub Actions successfully builds and publishes Docker images

## 8. Project Structure

```
print-mark/
├── src/
│   ├── server/
│   │   ├── index.ts              # Server entry point
│   │   ├── routes/
│   │   │   ├── health.ts
│   │   │   ├── themes.ts
│   │   │   ├── pdf.ts
│   │   │   └── upload.ts
│   │   ├── services/
│   │   │   ├── markdown.ts
│   │   │   ├── pdf.ts
│   │   │   └── themes.ts
│   │   └── config.ts
│   │
│   ├── client/
│   │   ├── index.html
│   │   ├── main.ts
│   │   ├── styles/
│   │   │   ├── app.css
│   │   │   └── themes/
│   │   │       ├── _base.css
│   │   │       ├── clean.css
│   │   │       ├── academic.css
│   │   │       ├── modern.css
│   │   │       └── compact.css
│   │   └── components/
│   │       ├── editor.ts
│   │       ├── preview.ts
│   │       ├── toolbar.ts
│   │       └── theme-picker.ts
│   │
│   └── shared/
│       ├── types.ts
│       └── markdown-config.ts
│
├── public/                        # Static assets
├── dist/                          # Build output
├── specs/                         # Planning documents
├── .github/
│   └── workflows/
│       └── docker-publish.yml
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 9. GitHub Actions Workflow

```yaml
name: Build and Push Docker Image

on:
  release:
    types: [published]
  push:
    tags:
      - 'v*.*.*'
  workflow_dispatch:

env:
  GHCR_REGISTRY: ghcr.io
  DOCKERHUB_REGISTRY: docker.io
  IMAGE_NAME: ${{ github.repository_owner }}/print-mark

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.GHCR_REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          registry: ${{ env.DOCKERHUB_REGISTRY }}
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Extract metadata (tags, labels)
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: |
            ${{ env.GHCR_REGISTRY }}/${{ env.IMAGE_NAME }}
            ${{ env.DOCKERHUB_REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=raw,value=latest,enable={{is_default_branch}}
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=semver,pattern={{major}},enable=${{ !startsWith(github.ref, 'refs/tags/v0.') }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            VERSION=${{ steps.meta.outputs.version }}
```

## 10. Assumptions

1. Users have modern browsers with JavaScript enabled
2. Docker deployment will be behind a reverse proxy that handles SSL
3. The application will not need to handle more than 10 concurrent PDF requests
4. External image URLs in markdown are publicly accessible (no auth required)
5. 25MB is sufficient for any reasonable markdown document
6. GitHub Actions secrets for Docker Hub will be configured by the user
