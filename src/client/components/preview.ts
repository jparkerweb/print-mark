import { getState, subscribe } from '../state.js'
import { renderSanitized } from '../services/markdown.js'
import type { ThemeId } from '../../shared/types.js'

let shadowRoot: ShadowRoot | null = null
let contentElement: HTMLElement | null = null
let styleElement: HTMLStyleElement | null = null
let currentThemeId: ThemeId | null = null
let themeCache: Map<ThemeId, string> = new Map()

export function createPreview(container: HTMLElement): void {
  // Create shadow DOM host
  const shadowHost = document.createElement('div')
  shadowHost.className = 'preview-shadow-host'
  container.appendChild(shadowHost)

  shadowRoot = shadowHost.attachShadow({ mode: 'open' })

  // Create style element for theme CSS
  styleElement = document.createElement('style')
  shadowRoot.appendChild(styleElement)

  // Create content wrapper
  contentElement = document.createElement('div')
  contentElement.className = 'preview-content preview-mode'
  shadowRoot.appendChild(contentElement)

  // Initial render
  renderPreview()

  // Subscribe to state changes
  subscribe((state, prevState) => {
    if (state.markdown !== prevState.markdown) {
      renderPreview()
    }
    if (state.themeId !== prevState.themeId) {
      applyTheme(state.themeId)
    }
  })

  // Load initial theme
  const state = getState()
  applyTheme(state.themeId)
}

function renderPreview(): void {
  if (!contentElement) return

  const state = getState()
  const markdown = state.markdown

  if (!markdown.trim()) {
    contentElement.innerHTML = `
      <div class="preview-empty">
        <div class="preview-empty-icon">\u{1F4DD}</div>
        <div class="preview-empty-title">No content yet</div>
        <div class="preview-empty-text">Start typing in the editor or upload a Markdown file</div>
      </div>
    `
    return
  }

  const html = renderSanitized(markdown)
  contentElement.innerHTML = html
}

async function applyTheme(themeId: ThemeId): Promise<void> {
  if (!styleElement || currentThemeId === themeId) return

  currentThemeId = themeId

  try {
    let css = themeCache.get(themeId)

    if (!css) {
      // Fetch base CSS and theme CSS
      const [baseCss, themeCss] = await Promise.all([
        fetchThemeCSS('_base'),
        fetchThemeCSS(themeId),
      ])

      css = baseCss + '\n' + themeCss
      themeCache.set(themeId, css)
    }

    styleElement.textContent = css
  } catch (error) {
    console.error('Failed to load theme:', error)
    // Apply minimal fallback styles
    styleElement.textContent = getMinimalFallbackCSS()
  }
}

async function fetchThemeCSS(themeId: string): Promise<string> {
  const response = await fetch(`/styles/themes/${themeId}.css`)
  if (!response.ok) {
    throw new Error(`Failed to load theme: ${response.status}`)
  }
  return response.text()
}

function getMinimalFallbackCSS(): string {
  return `
    .preview-content {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #1a1a1a;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: 600;
    }
    p { margin: 1em 0; }
    code {
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: monospace;
    }
    pre {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
    }
    pre code {
      background: none;
      padding: 0;
    }
    .preview-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      color: #6b7280;
      text-align: center;
    }
    .preview-empty-icon { font-size: 48px; margin-bottom: 16px; }
    .preview-empty-title { font-size: 16px; font-weight: 500; }
    .preview-empty-text { font-size: 14px; opacity: 0.8; }
  `
}

// Scroll sync functions
let scrollSyncEnabled = false
let editorScrollHandler: ((e: Event) => void) | null = null
let previewScrollHandler: ((e: Event) => void) | null = null
let isScrolling = false

export function enableScrollSync(editorContainer: HTMLElement): void {
  if (scrollSyncEnabled || !shadowRoot) return
  scrollSyncEnabled = true

  const previewHost = shadowRoot.host as HTMLElement

  editorScrollHandler = () => {
    if (isScrolling) return
    isScrolling = true

    const editorScroller = editorContainer.querySelector('.cm-scroller') as HTMLElement
    if (!editorScroller) {
      isScrolling = false
      return
    }

    const scrollRatio = editorScroller.scrollTop / (editorScroller.scrollHeight - editorScroller.clientHeight)
    const previewScrollTop = scrollRatio * (previewHost.scrollHeight - previewHost.clientHeight)

    previewHost.scrollTop = previewScrollTop

    requestAnimationFrame(() => {
      isScrolling = false
    })
  }

  previewScrollHandler = () => {
    if (isScrolling) return
    isScrolling = true

    const editorScroller = editorContainer.querySelector('.cm-scroller') as HTMLElement
    if (!editorScroller) {
      isScrolling = false
      return
    }

    const scrollRatio = previewHost.scrollTop / (previewHost.scrollHeight - previewHost.clientHeight)
    const editorScrollTop = scrollRatio * (editorScroller.scrollHeight - editorScroller.clientHeight)

    editorScroller.scrollTop = editorScrollTop

    requestAnimationFrame(() => {
      isScrolling = false
    })
  }

  const editorScroller = editorContainer.querySelector('.cm-scroller')
  editorScroller?.addEventListener('scroll', editorScrollHandler, { passive: true })
  previewHost.addEventListener('scroll', previewScrollHandler, { passive: true })
}

export function disableScrollSync(editorContainer: HTMLElement): void {
  if (!scrollSyncEnabled || !shadowRoot) return
  scrollSyncEnabled = false

  const previewHost = shadowRoot.host as HTMLElement

  if (editorScrollHandler) {
    const editorScroller = editorContainer.querySelector('.cm-scroller')
    editorScroller?.removeEventListener('scroll', editorScrollHandler)
    editorScrollHandler = null
  }

  if (previewScrollHandler) {
    previewHost.removeEventListener('scroll', previewScrollHandler)
    previewScrollHandler = null
  }
}

export function isScrollSyncEnabled(): boolean {
  return scrollSyncEnabled
}
