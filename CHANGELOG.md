# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2025-12-22

### ✨ Added

- **B5 Paper Size** - ISO B5 (176mm × 250mm) paper size option for PDF export
- **5 New Themes** - Executive, Manuscript, Technical, Minimalist, and Newsletter print-optimized themes
- **Preview Mode Styling** - Live preview now accurately represents printed/PDF output with matching styles

### 🔧 Changed

- Theme selection UI converted from button grid to native dropdown for better scalability
- All themes now include `.preview-mode` CSS rules for accurate live preview

## [1.0.2] - 2025-12-11

### ✨ Added

- **Testing Infrastructure**
  - Vitest test framework with 94 tests (77 unit, 17 integration)
  - Code coverage with v8 provider and HTML reports
  - Husky pre-commit hooks for automated linting and testing
  - lint-staged for running checks on staged TypeScript files only
  - Test helpers for server factory and Puppeteer mocking
  - Slow test suite for real Puppeteer PDF generation

### 🔧 Changed

- Refactored server to use `createApp()` factory function for testability
- Added test scripts: `test`, `test:watch`, `test:coverage`, `test:slow`, `test:all`

## [1.0.1] - 2025-12-08

### 🐛 Fixed

- Print window no longer closes automatically before user can interact with print dialog

## [1.0.0] - 2025-12-07

### ✨ Added

- **Markdown to HTML Conversion**
  - Full GitHub Flavored Markdown (GFM) support
  - Tables, task lists, and footnotes
  - Syntax highlighting with Shiki for 100+ languages
  - Auto-linking URLs

- **Print-Optimized Themes**
  - Clean: Minimal, professional styling
  - Academic: Scholarly formatting with serif fonts
  - Modern: Contemporary sans-serif design
  - Compact: Space-efficient for dense content

- **PDF Export**
  - Server-side PDF generation with Puppeteer
  - Customizable page sizes (A4, Letter, Legal)
  - Adjustable margins (normal, narrow, wide)
  - Optional page numbers in footer
  - Concurrent request limiting for stability

- **User Interface**
  - CodeMirror 6 editor with Markdown syntax highlighting
  - Real-time preview with scroll synchronization
  - Resizable split panes
  - Drag-and-drop file upload
  - Theme persistence in localStorage
  - Responsive design for desktop and tablet

- **File Upload Support**
  - Accepts .md, .markdown, and .txt files
  - Maximum file size: 25MB
  - Both button upload and drag-and-drop

- **API Endpoints**
  - `GET /api/health` - Health check endpoint
  - `GET /api/themes` - List available themes
  - `POST /api/pdf` - Generate PDF from Markdown
  - `POST /api/upload` - Upload Markdown file

- **Docker Deployment**
  - Multi-stage Dockerfile for optimized images
  - Alpine-based image with Chromium for PDF generation
  - Docker Compose configuration
  - GitHub Actions workflow for automated builds
  - Health checks for container orchestration

- **Security**
  - XSS prevention with DOMPurify sanitization
  - Input validation with Zod schemas
  - File type and size validation
  - Non-root container user

### Security

- HTML sanitization prevents XSS attacks in rendered output
- All user input validated before processing
- No data persistence - fully stateless design
