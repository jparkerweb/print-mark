# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-07

### Added

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

[1.0.0]: https://github.com/YOUR_USERNAME/print-mark/releases/tag/v1.0.0
