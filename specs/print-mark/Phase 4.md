# Phase 4: Frontend Application

**Status:** Complete
**Estimated Tasks:** 28 tasks

## Overview

This phase builds the complete user interface including the markdown editor, live preview panel, toolbar with actions, theme picker, and file upload functionality. The UI uses a split-pane layout with the editor on the left and preview on the right.

## Prerequisites

- [x] Phase 2 must be complete (markdown rendering)
- [x] Phase 3 must be complete (theme CSS available)
- [x] Server runs and serves static files

## Tasks

### Dependencies Installation

- [x] **Task 4.1:** Install CodeMirror 6 packages
  - Run: `npm install @codemirror/state @codemirror/view @codemirror/lang-markdown @codemirror/language @codemirror/commands @codemirror/search`
  - Run: `npm install @codemirror/theme-one-dark` (optional dark theme for editor)

### Application Layout

- [x] **Task 4.2:** Update HTML entry point
  - File: `src/client/index.html`
  - Add viewport meta tag for responsive design
  - Add favicon link (create simple favicon or use placeholder)
  - Structure: header (toolbar), main (editor + preview panels)

- [x] **Task 4.3:** Create application layout styles
  - File: `src/client/styles/app.css`
  - Full viewport layout using CSS Grid or Flexbox
  - Header: fixed height (50-60px), full width
  - Main content: fills remaining height
  - Split pane: 50/50 by default, resizable later

- [x] **Task 4.4:** Create main application entry point
  - File: `src/client/main.ts`
  - Import styles
  - Initialize all components in order
  - Fetch themes from API on startup
  - Set up global state for current theme, markdown content
  - Render initial UI

### State Management

- [x] **Task 4.5:** Create simple state management
  - File: `src/client/state.ts`
  - Define `AppState` interface: `{ markdown: string, themeId: ThemeId, themes: Theme[], isLoading: boolean }`
  - Export reactive state using Proxy or simple pub/sub pattern
  - Export `subscribe(callback)` function for state changes
  - Export `setState(partial)` function for updates

### Toolbar Component

- [x] **Task 4.6:** Create toolbar styles
  - File: `src/client/styles/toolbar.css`
  - Horizontal flex container
  - Left section: logo/title, file upload
  - Center section: theme picker
  - Right section: action buttons (Copy HTML, Print, Export PDF)
  - Button styles: consistent padding, hover states

- [x] **Task 4.7:** Create toolbar component
  - File: `src/client/components/toolbar.ts`
  - Export `createToolbar()` function that returns DOM element
  - Create app title/logo
  - Create upload button with hidden file input
  - Import and include theme picker component
  - Create action buttons with click handlers (placeholder for now)

- [x] **Task 4.8:** Implement file upload handler
  - In `src/client/components/toolbar.ts`
  - Handle file input change event
  - Validate file extension (.md, .markdown, .txt)
  - Validate file size (< 25MB)
  - Read file as text using FileReader
  - Update state with file content
  - Show error message for invalid files

- [x] **Task 4.9:** Implement drag-and-drop file upload
  - In `src/client/components/toolbar.ts` or separate handler
  - Add dragover, drop event listeners to document
  - Show visual indicator during drag
  - Handle dropped .md files same as upload
  - Prevent default browser behavior

### Theme Picker Component

- [x] **Task 4.10:** Create theme picker styles
  - File: `src/client/styles/theme-picker.css`
  - Dropdown/select styling
  - Show theme name and description
  - Highlight current selection

- [x] **Task 4.11:** Create theme picker component
  - File: `src/client/components/theme-picker.ts`
  - Export `createThemePicker()` function
  - Render dropdown/select with theme options
  - Subscribe to state for available themes
  - On change, update state with selected theme ID
  - Dispatch custom event for theme change

### Editor Component

- [x] **Task 4.12:** Create editor styles
  - File: `src/client/styles/editor.css`
  - Editor container fills left panel
  - CodeMirror overrides for consistent appearance
  - Line numbers styling
  - Scrollbar styling

- [x] **Task 4.13:** Create CodeMirror editor component
  - File: `src/client/components/editor.ts`
  - Export `createEditor(container, initialContent)` function
  - Initialize CodeMirror with markdown language support
  - Enable line numbers, line wrapping
  - Set up basic keybindings (undo, redo, etc.)
  - Return EditorView instance

- [x] **Task 4.14:** Implement editor content sync
  - In `src/client/components/editor.ts`
  - Listen for document changes via updateListener
  - Debounce updates (300ms) to avoid excessive re-renders
  - Update state with new markdown content
  - Export function to set editor content programmatically

- [x] **Task 4.15:** Add editor placeholder content
  - In `src/client/components/editor.ts`
  - Create default markdown content demonstrating features
  - Include: headings, lists, code blocks, links, images, tables
  - Set as initial editor content if no content provided

### Preview Component

- [x] **Task 4.16:** Create preview styles
  - File: `src/client/styles/preview.css`
  - Preview container fills right panel
  - Scrollable content area
  - Loading state indicator
  - Content wrapper with padding

- [x] **Task 4.17:** Create preview component
  - File: `src/client/components/preview.ts`
  - Export `createPreview(container)` function
  - Subscribe to state for markdown content and theme changes
  - Render markdown to HTML using client markdown service
  - Insert rendered HTML into preview container

- [x] **Task 4.18:** Implement theme application in preview
  - In `src/client/components/preview.ts`
  - Load theme CSS dynamically (fetch or inline)
  - Apply theme CSS to preview container
  - Update when theme changes in state
  - Use Shadow DOM or scoped styles to isolate theme CSS from app CSS

- [x] **Task 4.19:** Implement scroll sync (optional enhancement)
  - In `src/client/components/preview.ts`
  - Sync scroll position between editor and preview
  - Calculate proportional scroll position
  - Add toggle to enable/disable sync

### Action Handlers

- [x] **Task 4.20:** Implement "Copy HTML" action
  - In `src/client/components/toolbar.ts` or separate actions file
  - Get current rendered HTML from preview
  - Copy to clipboard using Clipboard API
  - Show success/error toast notification

- [x] **Task 4.21:** Implement "Print" action
  - In `src/client/components/toolbar.ts`
  - Open browser print dialog with preview content
  - Ensure theme styles are included in print
  - May need to open in new window for clean print

- [x] **Task 4.22:** Create "Export PDF" button (UI only)
  - In `src/client/components/toolbar.ts`
  - Add Export PDF button to toolbar
  - Show loading state during export
  - Actual PDF generation will be implemented in Phase 5

### Toast Notifications

- [x] **Task 4.23:** Create toast notification system
  - File: `src/client/components/toast.ts`
  - Export `showToast(message, type)` function
  - Types: success, error, info
  - Auto-dismiss after 3 seconds
  - Stack multiple toasts vertically

- [x] **Task 4.24:** Create toast styles
  - File: `src/client/styles/toast.css`
  - Fixed position (bottom-right or top-right)
  - Color-coded by type (green/red/blue)
  - Slide-in animation
  - Close button

### Responsive Layout

- [x] **Task 4.25:** Add responsive styles
  - File: `src/client/styles/responsive.css`
  - Mobile breakpoint: < 768px
  - Stack editor and preview vertically on mobile
  - Adjust toolbar for mobile (hamburger menu or simplified)
  - Ensure touch-friendly button sizes

- [x] **Task 4.26:** Add split-pane resizing (optional)
  - In `src/client/main.ts` or separate component
  - Add draggable divider between editor and preview
  - Save preferred size to localStorage
  - Restore on page load

### Error Handling

- [x] **Task 4.27:** Implement error boundary
  - In `src/client/main.ts`
  - Catch unhandled errors
  - Show user-friendly error message
  - Log errors to console for debugging
  - Provide "reload" button

### Verification

- [x] **Task 4.28:** Verify frontend functionality
  - Load application in browser
  - Type markdown in editor - preview updates live
  - Upload .md file - content loads in editor
  - Drag-drop .md file - content loads in editor
  - Switch themes - preview styling changes
  - Click "Copy HTML" - HTML copied to clipboard
  - Click "Print" - print dialog opens with styled content
  - Resize browser - responsive layout works
  - Check for console errors - none should appear

## Acceptance Criteria

- [x] Editor accepts markdown input with syntax highlighting
- [x] Preview updates in real-time as user types (debounced)
- [x] File upload works via button click and drag-drop
- [x] Theme picker shows all 4 themes
- [x] Theme changes are reflected immediately in preview
- [x] "Copy HTML" copies sanitized HTML to clipboard
- [x] "Print" opens browser print dialog with correct styling
- [x] UI is responsive and works on mobile screens
- [x] No JavaScript errors in browser console
- [x] Loading states are shown during async operations

## Notes

- The PDF export button will be connected in Phase 5
- Scroll sync is optional - implement if time permits
- Theme CSS isolation is important to prevent styles leaking into app UI
- CodeMirror 6 has a modular architecture - only import what's needed
- Consider lazy-loading CodeMirror for faster initial page load

---

## Phase Completion Summary

**Completed:** 2025-12-07
**Implemented by:** Claude Opus 4.5

### What was done:

Built the complete frontend application with a split-pane layout featuring a CodeMirror 6 markdown editor on the left and a live preview panel on the right. Implemented a toolbar with file upload (button and drag-drop), theme picker dropdown, and action buttons (Copy HTML, Print, Export PDF). Created a reactive state management system with pub/sub pattern. Used Shadow DOM to isolate theme CSS in the preview from application styles. Added scroll sync between editor and preview, resizable split pane with localStorage persistence, toast notifications, responsive layout for mobile, and global error handling.

### Files created/modified:

- `src/client/index.html` - Updated with semantic structure (header, main, panels)
- `src/client/main.ts` - Main application entry point with initialization
- `src/client/state.ts` - Simple reactive state management
- `src/client/styles/app.css` - Application layout and base styles
- `src/client/styles/toolbar.css` - Toolbar component styles
- `src/client/styles/theme-picker.css` - Theme picker dropdown styles
- `src/client/styles/editor.css` - CodeMirror editor styles
- `src/client/styles/preview.css` - Preview panel styles
- `src/client/styles/toast.css` - Toast notification styles
- `src/client/styles/responsive.css` - Mobile responsive styles
- `src/client/components/toolbar.ts` - Toolbar with file upload, drag-drop, actions
- `src/client/components/theme-picker.ts` - Theme selection dropdown
- `src/client/components/editor.ts` - CodeMirror 6 editor component
- `src/client/components/preview.ts` - Live preview with Shadow DOM isolation
- `src/client/components/toast.ts` - Toast notification system
- `src/client/components/default-content.ts` - Sample markdown content
- `package.json` - Added CodeMirror 6 dependencies

### Issues encountered:

Minor fix required for Copy HTML and Print actions to properly access Shadow DOM content. Fixed by querying the shadow root to get the preview content element.
