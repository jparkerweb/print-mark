# Phase 3: Theme System

**Status:** Complete
**Estimated Tasks:** 22 tasks

## Overview

This phase creates the print-optimized CSS theme system. Themes are designed for PDF output and print quality, with careful attention to typography, spacing, and page break behavior. The theme service provides an API for listing and loading themes.

## Prerequisites

- [x] Phase 2 must be complete
- [x] Markdown rendering works on both client and server

## Tasks

### Base Print Stylesheet

- [x] **Task 3.1:** Create base print stylesheet
  - File: `src/client/styles/themes/_base.css`
  - Reset print margins and padding
  - Set `box-sizing: border-box` globally
  - Define CSS custom properties for theme overrides:
    - `--font-body`, `--font-heading`, `--font-mono`
    - `--font-size-base`, `--line-height-base`
    - `--color-text`, `--color-heading`, `--color-link`, `--color-code-bg`
    - `--spacing-paragraph`, `--spacing-heading`
  - Style base typography: body, headings (h1-h6), paragraphs
  - Style links (color, underline behavior for print)
  - Style lists (ul, ol, nested lists, proper indentation)
  - Style blockquotes (left border, italic, indentation)
  - Style horizontal rules

- [x] **Task 3.2:** Add code block styling to base stylesheet
  - In `src/client/styles/themes/_base.css`
  - Style `pre` and `code` elements
  - Set monospace font stack: `'SF Mono', 'Fira Code', 'Consolas', monospace`
  - Add background color, padding, border-radius
  - Prevent code from overflowing page (word-wrap)
  - Style inline code differently from code blocks

- [x] **Task 3.3:** Add table styling to base stylesheet
  - In `src/client/styles/themes/_base.css`
  - Style tables with borders, proper cell padding
  - Alternate row colors (zebra striping) using CSS
  - Ensure tables don't overflow page width
  - Style table headers (bold, background color)

- [x] **Task 3.4:** Add task list styling to base stylesheet
  - In `src/client/styles/themes/_base.css`
  - Style task list checkboxes
  - Remove default list bullets for task lists
  - Style checked vs unchecked states

- [x] **Task 3.5:** Add print-specific rules to base stylesheet
  - In `src/client/styles/themes/_base.css`
  - `@media print` rules
  - Avoid page breaks inside code blocks, blockquotes, tables
  - Keep headings with following content (`break-after: avoid`)
  - Remove decorative elements that don't print well
  - Set appropriate page margins

- [x] **Task 3.6:** Add footnote styling to base stylesheet
  - In `src/client/styles/themes/_base.css`
  - Style footnote references (superscript)
  - Style footnote section at bottom
  - Style back-reference links

### Clean Theme

- [x] **Task 3.7:** Create Clean theme stylesheet
  - File: `src/client/styles/themes/clean.css`
  - Import `_base.css`
  - Font: System sans-serif stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`)
  - Font size: 16px base, 1.6 line height
  - Colors: Dark gray text (#333), blue links (#0066cc)
  - Generous white space, clean margins
  - Minimal decorative elements

- [x] **Task 3.8:** Add Clean theme metadata
  - In `src/client/styles/themes/clean.css`
  - CSS custom property: `--theme-id: 'clean'`
  - CSS custom property: `--theme-name: 'Clean'`

### Academic Theme

- [x] **Task 3.9:** Create Academic theme stylesheet
  - File: `src/client/styles/themes/academic.css`
  - Import `_base.css`
  - Font: Serif stack (`Georgia, 'Times New Roman', Times, serif`)
  - Font size: 12pt base (print-standard), 1.5 line height
  - Colors: Black text, traditional blue links
  - Justified text alignment for body
  - Traditional academic paper styling

- [x] **Task 3.10:** Add Academic theme specific elements
  - In `src/client/styles/themes/academic.css`
  - Indent first line of paragraphs (except after headings)
  - Style blockquotes with smaller font, double indentation
  - Number headings style (optional via class)
  - Footnotes at page bottom

### Modern Theme

- [x] **Task 3.11:** Create Modern theme stylesheet
  - File: `src/client/styles/themes/modern.css`
  - Import `_base.css`
  - Font: `Inter, -apple-system, BlinkMacSystemFont, sans-serif`
  - Font size: 15px base, 1.7 line height
  - Colors: Softer black (#1a1a1a), teal accent for links (#0891b2)
  - Subtle colored accents for headings
  - Modern, tech-documentation feel

- [x] **Task 3.12:** Add Modern theme decorative elements
  - In `src/client/styles/themes/modern.css`
  - Colored left border on code blocks
  - Subtle background on blockquotes
  - Pill-style inline code
  - Rounded corners where appropriate

### Compact Theme

- [x] **Task 3.13:** Create Compact theme stylesheet
  - File: `src/client/styles/themes/compact.css`
  - Import `_base.css`
  - Font: Small sans-serif, `'Segoe UI', Roboto, sans-serif`
  - Font size: 11px base, 1.4 line height
  - Reduced margins and padding throughout
  - Optimized for maximum content per page

- [x] **Task 3.14:** Add Compact theme density optimizations
  - In `src/client/styles/themes/compact.css`
  - Smaller heading sizes (h1: 18px, h2: 16px, etc.)
  - Tighter list spacing
  - Compact table styling
  - Reduced code block padding

### Theme Service (Server)

- [x] **Task 3.15:** Create theme service
  - File: `src/server/services/themes.ts`
  - Define themes metadata array with id, name, description for each theme
  - Export `ThemeService` class

- [x] **Task 3.16:** Implement `getThemes()` method
  - In `src/server/services/themes.ts`
  - Returns array of all theme metadata objects
  - Returns `Theme[]` type from shared types

- [x] **Task 3.17:** Implement `getThemeCSS()` method
  - In `src/server/services/themes.ts`
  - Method signature: `getThemeCSS(themeId: ThemeId): Promise<string>`
  - Read CSS file from `dist/client/styles/themes/<themeId>.css`
  - Include base CSS in the returned string
  - Cache CSS content in memory for performance
  - Throw error for unknown theme IDs

- [x] **Task 3.18:** Export singleton instance
  - In `src/server/services/themes.ts`
  - Export `themeService` as singleton

### Themes API Endpoint

- [x] **Task 3.19:** Create themes route
  - File: `src/server/routes/themes.ts`
  - Export function that registers `GET /api/themes` route
  - Return `{ themes: Theme[] }` response
  - Use themeService.getThemes()

- [x] **Task 3.20:** Register themes route in server
  - File: `src/server/index.ts`
  - Import and register themes route

### Build Configuration

- [x] **Task 3.21:** Configure Vite to copy theme CSS
  - File: `vite.config.ts`
  - Ensure theme CSS files are included in build output
  - CSS files should be in `dist/client/styles/themes/`

### Verification

- [x] **Task 3.22:** Verify theme system
  - Build project with `npm run build`
  - Verify all theme CSS files exist in `dist/client/styles/themes/`
  - Call `GET /api/themes` - should return 4 themes
  - Load each theme CSS via themeService - should return valid CSS
  - Apply each theme to sample markdown HTML - verify visual appearance
  - Print test page in browser - verify print styling works

## Acceptance Criteria

- [x] Base stylesheet provides consistent foundation for all themes
- [x] All 4 themes (clean, academic, modern, compact) render correctly
- [x] `GET /api/themes` returns theme metadata for all themes
- [x] Theme CSS can be loaded by theme ID
- [x] Code blocks have proper syntax highlighting colors in each theme
- [x] Tables render with proper styling in each theme
- [x] Task lists show checkboxes correctly
- [x] Print preview in browser shows correct styling
- [x] Page breaks are handled appropriately (no orphaned headings)

## Notes

- Themes are CSS-only; no JavaScript customization
- Base stylesheet is not a theme itself - it's always included
- Theme CSS is loaded server-side for PDF generation and client-side for preview
- Print styles are essential for PDF output quality
- Consider testing with actual printed output if possible

---

## Phase Completion Summary

**Completed:** 2025-12-07
**Implemented by:** Claude Opus 4.5

### What was done:

Implemented a complete print-optimized CSS theme system with 4 distinct themes (Clean, Academic, Modern, Compact). Created a comprehensive base stylesheet with CSS custom properties for typography, colors, and spacing. Built a ThemeService that provides theme metadata via API and loads/caches theme CSS content. Configured Vite to copy theme CSS files to the build output.

### Files created/modified:

- `src/client/styles/themes/_base.css` - Base print stylesheet with CSS custom properties
- `src/client/styles/themes/clean.css` - Clean theme (minimal, professional)
- `src/client/styles/themes/academic.css` - Academic theme (serif, justified, print-standard)
- `src/client/styles/themes/modern.css` - Modern theme (contemporary with teal accents)
- `src/client/styles/themes/compact.css` - Compact theme (maximum content density)
- `src/server/services/themes.ts` - ThemeService class with getThemes() and getThemeCSS()
- `src/server/routes/themes.ts` - GET /api/themes endpoint
- `src/server/index.ts` - Registered themes route
- `vite.config.ts` - Added plugin to copy theme CSS to build output

### Issues encountered:

None
