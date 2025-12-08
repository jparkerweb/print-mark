// Styles
import './styles/app.css'
import './styles/toolbar.css'
import './styles/theme-picker.css'
import './styles/editor.css'
import './styles/preview.css'
import './styles/toast.css'
import './styles/responsive.css'

// State
import { setState, getState } from './state.js'
import type { Theme } from '../shared/types.js'

// Components
import { createToolbar, initDragAndDrop } from './components/toolbar.js'
import { createEditor } from './components/editor.js'
import { createPreview, enableScrollSync } from './components/preview.js'
import { showToast } from './components/toast.js'

// Initialize application
async function init(): Promise<void> {
  try {
    // Fetch themes from API
    await loadThemes()

    // Initialize components
    createToolbar()
    initEditor()
    initPreview()
    initDragAndDrop()
    initSplitPaneResize()

    // Mark as loaded
    setState({ isLoading: false })
  } catch (error) {
    handleError(error)
  }
}

async function loadThemes(): Promise<void> {
  try {
    const response = await fetch('/api/themes')
    if (!response.ok) {
      throw new Error(`Failed to fetch themes: ${response.status}`)
    }

    const data = await response.json() as { themes: Theme[] }
    setState({ themes: data.themes })

    // Set default theme if available
    if (data.themes.length > 0) {
      const savedTheme = localStorage.getItem('print-mark-theme')
      const themeId = savedTheme && data.themes.some((t) => t.id === savedTheme)
        ? savedTheme as typeof getState extends () => { themeId: infer T } ? T : never
        : data.themes[0].id as typeof getState extends () => { themeId: infer T } ? T : never

      setState({ themeId })
    }
  } catch (error) {
    console.error('Failed to load themes:', error)
    // Use fallback theme
    setState({
      themes: [
        { id: 'clean', name: 'Clean', description: 'Minimal, professional styling' },
      ],
      themeId: 'clean',
    })
  }
}

function initEditor(): void {
  const container = document.getElementById('editor-container')
  if (!container) {
    throw new Error('Editor container not found')
  }

  createEditor(container)
}

function initPreview(): void {
  const container = document.getElementById('preview-container')
  if (!container) {
    throw new Error('Preview container not found')
  }

  createPreview(container)

  // Enable scroll sync after a short delay to ensure editor is ready
  setTimeout(() => {
    const editorContainer = document.getElementById('editor-container')
    if (editorContainer) {
      enableScrollSync(editorContainer)
    }
  }, 100)
}

// Split pane resizing
function initSplitPaneResize(): void {
  const divider = document.getElementById('divider')
  const editorPanel = document.getElementById('editor-panel')
  const previewPanel = document.getElementById('preview-panel')
  const mainContent = document.getElementById('main-content')

  if (!divider || !editorPanel || !previewPanel || !mainContent) return

  let isDragging = false
  let startX = 0
  let startEditorWidth = 0

  // Restore saved width
  const savedWidth = localStorage.getItem('print-mark-editor-width')
  if (savedWidth) {
    const width = parseInt(savedWidth, 10)
    if (width > 200 && width < window.innerWidth - 200) {
      editorPanel.style.flex = `0 0 ${width}px`
      previewPanel.style.flex = '1'
    }
  }

  const onMouseDown = (e: MouseEvent | TouchEvent): void => {
    isDragging = true
    divider.classList.add('dragging')
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    startX = clientX
    startEditorWidth = editorPanel.getBoundingClientRect().width

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('touchmove', onMouseMove)
    document.addEventListener('touchend', onMouseUp)
  }

  const onMouseMove = (e: MouseEvent | TouchEvent): void => {
    if (!isDragging) return

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const delta = clientX - startX
    const newWidth = startEditorWidth + delta

    const minWidth = 300
    const maxWidth = window.innerWidth - 300

    if (newWidth >= minWidth && newWidth <= maxWidth) {
      editorPanel.style.flex = `0 0 ${newWidth}px`
      previewPanel.style.flex = '1'
    }
  }

  const onMouseUp = (): void => {
    if (!isDragging) return

    isDragging = false
    divider.classList.remove('dragging')
    document.body.style.cursor = ''
    document.body.style.userSelect = ''

    // Save width
    const width = editorPanel.getBoundingClientRect().width
    localStorage.setItem('print-mark-editor-width', String(Math.round(width)))

    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    document.removeEventListener('touchmove', onMouseMove)
    document.removeEventListener('touchend', onMouseUp)
  }

  divider.addEventListener('mousedown', onMouseDown)
  divider.addEventListener('touchstart', onMouseDown, { passive: true })

  // Reset on double click
  divider.addEventListener('dblclick', () => {
    editorPanel.style.flex = '1'
    previewPanel.style.flex = '1'
    localStorage.removeItem('print-mark-editor-width')
  })
}

// Error handling
function handleError(error: unknown): void {
  console.error('Application error:', error)

  const message = error instanceof Error ? error.message : 'An unexpected error occurred'
  showToast(message, 'error', 5000)

  // Show error UI if critical failure
  const app = document.body
  if (!document.querySelector('#editor-container .cm-editor')) {
    app.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 24px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">\u26A0\uFE0F</div>
        <h1 style="font-size: 20px; margin-bottom: 8px;">Something went wrong</h1>
        <p style="color: #6b7280; margin-bottom: 24px;">${escapeHtml(message)}</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
          Reload Application
        </button>
      </div>
    `
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// Global error handlers
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error)
  showToast('An unexpected error occurred', 'error')
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  showToast('An unexpected error occurred', 'error')
})

// Save theme preference when changed
window.addEventListener('themechange', (e: Event) => {
  const customEvent = e as CustomEvent<{ themeId: string }>
  localStorage.setItem('print-mark-theme', customEvent.detail.themeId)
})

// Start the application
init().catch(handleError)
