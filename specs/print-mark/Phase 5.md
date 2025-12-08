# Phase 5: PDF Generation

**Status:** Not Started
**Estimated Tasks:** 24 tasks

## Overview

This phase implements server-side PDF generation using Puppeteer. The PDF service renders markdown to HTML, applies theme styling, and generates a PDF with page numbers. Includes request validation, timeout handling, and concurrent request limiting.

## Prerequisites

- [ ] Phase 3 must be complete (theme CSS available)
- [ ] Phase 4 must be complete (frontend can send requests)
- [ ] Markdown service renders HTML correctly

## Tasks

### Dependencies Installation

- [ ] **Task 5.1:** Install Puppeteer
  - Run: `npm install puppeteer`
  - This will download Chromium (~300MB) during install
  - Puppeteer 23.x includes Chrome for Testing

### PDF Service Setup

- [ ] **Task 5.2:** Create PDF service file
  - File: `src/server/services/pdf.ts`
  - Import Puppeteer, config, markdownService, themeService
  - Define `PDFService` class

- [ ] **Task 5.3:** Implement browser instance management
  - In `src/server/services/pdf.ts`
  - Create private `browser` property (lazy-initialized)
  - Implement `getBrowser()` method that creates or returns existing browser
  - Configure browser: `headless: true`, `args: ['--no-sandbox', '--disable-setuid-sandbox']`
  - Add `closeBrowser()` method for cleanup

- [ ] **Task 5.4:** Implement concurrent request limiting
  - In `src/server/services/pdf.ts`
  - Create semaphore/queue for limiting concurrent PDF generations
  - Use `PDF_CONCURRENT_LIMIT` from config (default: 3)
  - Queue excess requests, reject if queue too long
  - Implement `acquireLock()` and `releaseLock()` helpers

### HTML Template for PDF

- [ ] **Task 5.5:** Create HTML template for PDF rendering
  - In `src/server/services/pdf.ts`
  - Create `generateHTMLDocument(content, themeCSS)` function
  - Complete HTML document with DOCTYPE, head, body
  - Include theme CSS in style tag
  - Add base styles for PDF-specific adjustments
  - Ensure proper character encoding (UTF-8)

- [ ] **Task 5.6:** Add print-specific CSS to template
  - In `src/server/services/pdf.ts`
  - Add `@page` rules for margins based on options
  - Page margin presets: normal (20mm), narrow (10mm), wide (25mm)
  - Set page size from options (A4, Letter, Legal)

### PDF Generation Method

- [ ] **Task 5.7:** Implement `generatePDF()` method
  - In `src/server/services/pdf.ts`
  - Method signature: `generatePDF(options: PDFRequest): Promise<Buffer>`
  - Acquire concurrent request lock
  - Wrap in try/finally to always release lock

- [ ] **Task 5.8:** Implement HTML rendering step
  - In `src/server/services/pdf.ts` within `generatePDF()`
  - Call `markdownService.renderSanitized(options.markdown)`
  - Get theme CSS via `themeService.getThemeCSS(options.theme)`
  - Generate complete HTML document

- [ ] **Task 5.9:** Implement Puppeteer page creation
  - In `src/server/services/pdf.ts` within `generatePDF()`
  - Get browser instance
  - Create new page
  - Set viewport size (A4 width: 794px)
  - Set content with `page.setContent(html, { waitUntil: 'networkidle0' })`

- [ ] **Task 5.10:** Implement PDF generation with page numbers
  - In `src/server/services/pdf.ts` within `generatePDF()`
  - Use `page.pdf()` with options:
    - `format`: from request options (A4, Letter, Legal)
    - `printBackground: true`
    - `margin`: based on request options
    - `displayHeaderFooter: true` if page numbers enabled
    - `footerTemplate`: HTML for page numbers (`Page <span class="pageNumber"></span> of <span class="totalPages"></span>`)
    - `headerTemplate`: empty string (required when footer is set)

- [ ] **Task 5.11:** Implement cleanup and return
  - In `src/server/services/pdf.ts` within `generatePDF()`
  - Close the page after PDF generation
  - Return PDF buffer
  - Handle errors and ensure page is closed in finally block

### Timeout Handling

- [ ] **Task 5.12:** Add timeout wrapper
  - In `src/server/services/pdf.ts`
  - Create `withTimeout(promise, ms, errorMessage)` helper
  - Use `PDF_TIMEOUT` from config
  - Throw descriptive error on timeout
  - Ensure cleanup on timeout (close page)

### PDF Route

- [ ] **Task 5.13:** Create PDF route file
  - File: `src/server/routes/pdf.ts`
  - Import Fastify types, Zod, pdfService

- [ ] **Task 5.14:** Define request validation schema
  - In `src/server/routes/pdf.ts`
  - Use Zod to validate request body:
    - `markdown`: string, required, max length based on MAX_FILE_SIZE
    - `theme`: enum of valid theme IDs
    - `options.pageSize`: enum 'A4' | 'Letter' | 'Legal', default 'A4'
    - `options.margins`: enum 'normal' | 'narrow' | 'wide', default 'normal'
    - `options.includePageNumbers`: boolean, default true

- [ ] **Task 5.15:** Implement POST /api/pdf handler
  - In `src/server/routes/pdf.ts`
  - Validate request body with Zod schema
  - Return 400 with validation errors if invalid
  - Call `pdfService.generatePDF(validatedBody)`
  - Set response headers:
    - `Content-Type: application/pdf`
    - `Content-Disposition: attachment; filename="document.pdf"`
  - Return PDF buffer as response

- [ ] **Task 5.16:** Add error handling to route
  - In `src/server/routes/pdf.ts`
  - Catch timeout errors → 408 Request Timeout
  - Catch validation errors → 400 Bad Request
  - Catch other errors → 500 Internal Server Error
  - Log errors with request ID for debugging
  - Return user-friendly error messages

- [ ] **Task 5.17:** Register PDF route in server
  - File: `src/server/index.ts`
  - Import and register PDF route

### File Upload Route

- [ ] **Task 5.18:** Create upload route file
  - File: `src/server/routes/upload.ts`
  - Handle `POST /api/upload` with multipart form data

- [ ] **Task 5.19:** Implement file upload handler
  - In `src/server/routes/upload.ts`
  - Accept file field named 'file'
  - Validate file extension (.md, .markdown, .txt)
  - Validate file size (< MAX_FILE_SIZE)
  - Read file content as UTF-8 string
  - Return `{ filename, content, size }`

- [ ] **Task 5.20:** Register upload route in server
  - File: `src/server/index.ts`
  - Import and register upload route

### Frontend Integration

- [ ] **Task 5.21:** Implement PDF export API call
  - File: `src/client/services/api.ts` (create if needed)
  - Export `exportPDF(markdown, theme, options)` function
  - Make POST request to `/api/pdf`
  - Handle response as blob
  - Return blob for download

- [ ] **Task 5.22:** Connect Export PDF button
  - In `src/client/components/toolbar.ts`
  - On click, show loading state
  - Get current markdown and theme from state
  - Call `exportPDF()` service function
  - Trigger browser download of PDF blob
  - Hide loading state
  - Show toast on success/error

- [ ] **Task 5.23:** Add PDF options UI (optional)
  - In `src/client/components/toolbar.ts` or modal
  - Add dropdown for page size (A4, Letter, Legal)
  - Add dropdown for margins (Normal, Narrow, Wide)
  - Add checkbox for page numbers
  - Store preferences in state/localStorage

### Verification

- [ ] **Task 5.24:** Verify PDF generation
  - Test with simple markdown → PDF generates
  - Test with code blocks → syntax highlighting in PDF
  - Test with all 4 themes → each renders correctly
  - Test page numbers → footer shows "Page X of Y"
  - Test different page sizes → A4, Letter, Legal work
  - Test with large document → completes within timeout
  - Test concurrent requests → requests are queued/limited
  - Test invalid markdown → returns 400 with clear error
  - Test very long document (approaching 25MB) → handles gracefully
  - Open generated PDF in multiple viewers (Chrome, Acrobat, Preview)

## Acceptance Criteria

- [ ] `POST /api/pdf` generates valid PDF from markdown
- [ ] PDF includes page numbers in footer (when enabled)
- [ ] All 4 themes render correctly in PDF
- [ ] PDF respects page size option (A4, Letter, Legal)
- [ ] PDF respects margin option (normal, narrow, wide)
- [ ] Concurrent requests are limited to prevent resource exhaustion
- [ ] Requests timeout after configured duration (default 30s)
- [ ] Invalid requests return 400 with validation errors
- [ ] File upload endpoint validates and returns file content
- [ ] Frontend can trigger PDF download successfully
- [ ] PDF renders code blocks with syntax highlighting
- [ ] Tables, task lists, footnotes render correctly in PDF

## Notes

- Puppeteer in Docker requires additional Chrome dependencies (Phase 6)
- Page numbers use built-in Puppeteer template classes
- Consider reusing browser pages instead of creating new ones for each request
- Large documents may need streaming or chunked processing
- PDF generation is CPU-intensive; monitor server resources
- The footer template must be valid HTML but styling is limited

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
