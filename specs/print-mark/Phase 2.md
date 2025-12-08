# Phase 2: Markdown Engine

**Status:** Complete
**Estimated Tasks:** 18 tasks

## Overview

This phase implements the core markdown-to-HTML conversion engine used by both client (for live preview) and server (for PDF generation). The configuration is shared to ensure preview matches PDF output exactly. Server-side includes Shiki for syntax highlighting; client-side uses a lightweight alternative for performance.

## Prerequisites

- [x] Phase 1 must be complete
- [x] Server starts successfully with `npm start`

## Tasks

### Dependencies Installation

- [x] **Task 2.1:** Install markdown-it and plugins
  - Run: `npm install markdown-it markdown-it-anchor markdown-it-task-lists markdown-it-footnote`
  - Run: `npm install -D @types/markdown-it @types/markdown-it-anchor @types/markdown-it-footnote`

- [x] **Task 2.2:** Install Shiki for server-side syntax highlighting
  - Run: `npm install shiki`

- [x] **Task 2.3:** Install DOMPurify and jsdom for HTML sanitization
  - Run: `npm install dompurify jsdom`
  - Run: `npm install -D @types/dompurify @types/jsdom`

### Shared Markdown Configuration

- [x] **Task 2.4:** Create shared markdown-it configuration
  - File: `src/shared/markdown-config.ts`
  - Export `MarkdownConfig` interface with all configurable options
  - Export `defaultMarkdownConfig` object with:
    - `html: true` (allow HTML in markdown)
    - `linkify: true` (auto-link URLs)
    - `typographer: true` (smart quotes, dashes)
    - `breaks: false` (require double newline for paragraph)
  - Export list of plugin names to load: `['anchor', 'task-lists', 'footnote']`
  - Export `anchorOptions`: `{ permalink: false, level: [1, 2, 3, 4] }`

### Server-Side Markdown Service

- [x] **Task 2.5:** Create server markdown service
  - File: `src/server/services/markdown.ts`
  - Import markdown-it, plugins, and shared config
  - Create `MarkdownService` class with async `initialize()` method
  - Store Shiki highlighter instance (lazy-loaded)

- [x] **Task 2.6:** Implement Shiki highlighter initialization
  - In `src/server/services/markdown.ts`
  - Create private `initHighlighter()` method
  - Load Shiki with themes: `github-light` (primary), `github-dark` (for future use)
  - Load common languages: `javascript`, `typescript`, `python`, `bash`, `json`, `html`, `css`, `markdown`, `yaml`, `sql`, `go`, `rust`
  - Cache highlighter instance for reuse

- [x] **Task 2.7:** Configure markdown-it with Shiki highlighting
  - In `src/server/services/markdown.ts`
  - Create markdown-it instance with shared config
  - Register all plugins from shared config
  - Override `highlight` function to use Shiki
  - Handle unknown languages gracefully (return escaped code)

- [x] **Task 2.8:** Implement `render()` method
  - In `src/server/services/markdown.ts`
  - Method signature: `render(markdown: string): Promise<string>`
  - Ensure highlighter is initialized before first render
  - Call `md.render()` and return HTML string

- [x] **Task 2.9:** Implement `renderSanitized()` method
  - In `src/server/services/markdown.ts`
  - Method signature: `renderSanitized(markdown: string): Promise<string>`
  - Call `render()` then sanitize with DOMPurify
  - Configure DOMPurify: allow `class` attributes, allow `id` attributes, allow `data-*` attributes
  - Use jsdom to create DOM environment for DOMPurify

- [x] **Task 2.10:** Export singleton instance
  - In `src/server/services/markdown.ts`
  - Export `markdownService` as singleton instance of `MarkdownService`
  - Export types for external use

### Client-Side Markdown Service

- [x] **Task 2.11:** Install client-side syntax highlighting
  - Run: `npm install highlight.js`
  - Lighter weight than Shiki for browser, acceptable visual difference in preview

- [x] **Task 2.12:** Create client markdown service
  - File: `src/client/services/markdown.ts`
  - Import markdown-it and shared config
  - Create markdown-it instance with shared config options
  - Register plugins (same as server)

- [x] **Task 2.13:** Configure highlight.js integration
  - In `src/client/services/markdown.ts`
  - Import highlight.js core and common languages
  - Set markdown-it `highlight` option to use hljs
  - Auto-detect language when not specified
  - Return properly escaped HTML for unknown languages

- [x] **Task 2.14:** Implement client `render()` function
  - In `src/client/services/markdown.ts`
  - Export function: `render(markdown: string): string`
  - Synchronous (no async needed for client)
  - Return rendered HTML

- [x] **Task 2.15:** Implement client `renderSanitized()` function
  - In `src/client/services/markdown.ts`
  - Run: `npm install isomorphic-dompurify` (works in browser without jsdom)
  - Export function: `renderSanitized(markdown: string): string`
  - Use same DOMPurify config as server

### Sanitization Configuration

- [x] **Task 2.16:** Create shared sanitization config
  - File: `src/shared/sanitize-config.ts`
  - Export DOMPurify configuration object
  - Allow tags: all standard HTML + `code`, `pre`, `span` (for syntax highlighting)
  - Allow attributes: `class`, `id`, `href`, `src`, `alt`, `title`, `data-*`
  - Forbid tags: `script`, `style`, `iframe`, `object`, `embed`, `form`
  - Allow `target="_blank"` on links but add `rel="noopener noreferrer"`

### Type Exports

- [x] **Task 2.17:** Add markdown types to shared types
  - File: `src/shared/types.ts`
  - Add `MarkdownRenderOptions` interface (for future extensibility)
  - Add `SanitizeConfig` type export

### Verification

- [x] **Task 2.18:** Verify markdown rendering
  - Create test markdown with: headings, code blocks (JS, Python), task lists, footnotes, links, images
  - Server: Import markdownService, call `renderSanitized()`, log output
  - Client: Call `renderSanitized()`, verify HTML renders correctly
  - Verify code blocks have syntax highlighting classes
  - Verify XSS payloads are sanitized (test: `<script>alert(1)</script>`)

## Acceptance Criteria

- [x] Server markdown service renders GFM markdown to HTML
- [x] Client markdown service renders GFM markdown to HTML
- [x] Code blocks have syntax highlighting applied
- [x] Task lists render as interactive checkboxes
- [x] Footnotes render correctly with back-references
- [x] Anchor IDs are added to headings
- [x] XSS payloads are stripped from output
- [x] `<script>`, `<iframe>`, and other dangerous tags are removed
- [x] Links work correctly, external links have `rel="noopener noreferrer"`

## Notes

- Server uses Shiki (VS Code-quality highlighting) for PDF output fidelity
- Client uses highlight.js for faster preview rendering
- Minor visual differences between preview and PDF are acceptable for code highlighting
- DOMPurify config is shared to ensure consistent security policy
- The markdown-it plugins must be loaded in the same order on client and server

---

## Phase Completion Summary

**Completed:** 2025-12-07
**Implemented by:** Claude Opus 4.5

### What was done:

Implemented the complete markdown-to-HTML conversion engine for both client and server. Server uses Shiki for VS Code-quality syntax highlighting while client uses highlight.js for faster preview rendering. Both services share the same DOMPurify configuration for consistent XSS prevention. All markdown features (GFM, task lists, footnotes, anchors) are working correctly.

### Files created/modified:

- `src/shared/markdown-config.ts` - Shared markdown-it configuration
- `src/shared/sanitize-config.ts` - Shared DOMPurify security configuration
- `src/shared/types.ts` - Added MarkdownRenderOptions and SanitizeConfig exports
- `src/server/services/markdown.ts` - Server markdown service with Shiki
- `src/client/services/markdown.ts` - Client markdown service with highlight.js
- `src/types/markdown-it-task-lists.d.ts` - Type declaration for markdown-it-task-lists
- `tsconfig.server.json` - Added types directory to include
- `package.json` - Added all markdown dependencies

### Issues encountered:

- markdown-it-task-lists package lacks TypeScript types - created custom type declaration
- DOMPurify typings incompatible with jsdom's DOMWindow - used type assertion to resolve
