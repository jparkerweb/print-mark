# print-mark - Implementation Overview

**Created:** 2025-12-07
**Source:** PLAN-DRAFT-20251207-180000.md
**Status:** In Progress

## Summary

print-mark is a web application that converts Markdown to clean, printable HTML with PDF export capabilities. Users can upload or paste Markdown content, preview it in real-time with selectable themes, and export to PDF with page numbers. The application is stateless, requires no authentication, and is deployable via Docker.

## Tech Stack

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

## Phase Checklist

- [x] Phase 1: Project Foundation - Initialize project structure, TypeScript, Vite, Fastify server with static file serving
- [x] Phase 2: Markdown Engine - Implement markdown-to-HTML conversion with shared configuration for client and server
- [x] Phase 3: Theme System - Create print-optimized CSS themes and theme management service
- [x] Phase 4: Frontend Application - Build the complete user interface with editor, preview, and toolbar
- [ ] Phase 5: PDF Generation - Implement server-side PDF export with Puppeteer
- [ ] Phase 6: Docker & Deployment - Containerize application and create CI/CD pipeline
- [ ] Phase 7: Polish & Documentation - Final polish, sample content, and README

## Quick Reference

### Key Files

```
src/
├── server/
│   ├── index.ts              # Server entry point
│   ├── routes/               # API route handlers
│   ├── services/             # Business logic services
│   └── config.ts             # Environment configuration
├── client/
│   ├── index.html            # HTML entry point
│   ├── main.ts               # Client entry point
│   ├── styles/               # CSS stylesheets
│   └── components/           # UI components
└── shared/
    ├── types.ts              # Shared TypeScript types
    └── markdown-config.ts    # Shared markdown-it configuration
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | HTTP port |
| `HOST` | 0.0.0.0 | Bind address |
| `NODE_ENV` | production | Environment |
| `MAX_FILE_SIZE` | 26214400 | Max upload size in bytes (25MB) |
| `PDF_TIMEOUT` | 30000 | PDF generation timeout in ms |
| `PDF_CONCURRENT_LIMIT` | 3 | Max concurrent PDF generations |

### External Dependencies

- Puppeteer requires Chromium browser (bundled or system-installed)
- No external services or APIs required
- Designed for deployment behind reverse proxy (nginx/traefik)

---

## Completion Summary

_[This section will be filled in during finalization]_
