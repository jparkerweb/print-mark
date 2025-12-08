import { setState, getState, subscribe } from '../state.js'
import { createThemePicker } from './theme-picker.js'
import { showToast } from './toast.js'

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB
const VALID_EXTENSIONS = ['.md', '.markdown', '.txt']

export function createToolbar(): HTMLElement {
  const toolbar = document.getElementById('toolbar')
  if (!toolbar) throw new Error('Toolbar container not found')

  toolbar.innerHTML = `
    <div class="toolbar-left">
      <a href="/" class="toolbar-logo">
        <span class="toolbar-logo-icon">\u{1F4C4}</span>
        <span>print-mark</span>
      </a>
      <div class="toolbar-divider"></div>
      <label class="upload-btn">
        <span class="upload-btn-icon">\u{1F4C1}</span>
        <span>Open File</span>
        <input type="file" accept=".md,.markdown,.txt" class="visually-hidden" id="file-input" />
      </label>
    </div>
    <div class="toolbar-center" id="theme-picker-container"></div>
    <div class="toolbar-right">
      <button type="button" class="toolbar-btn" id="copy-html-btn">
        <span class="toolbar-btn-icon">\u{1F4CB}</span>
        <span>Copy HTML</span>
      </button>
      <button type="button" class="toolbar-btn" id="print-btn">
        <span class="toolbar-btn-icon">\u{1F5A8}</span>
        <span>Print</span>
      </button>
      <button type="button" class="toolbar-btn toolbar-btn-primary" id="export-pdf-btn">
        <span class="toolbar-btn-icon">\u{1F4E5}</span>
        <span>Export PDF</span>
      </button>
    </div>
  `

  // Initialize theme picker
  const themePickerContainer = toolbar.querySelector('#theme-picker-container')
  if (themePickerContainer) {
    themePickerContainer.appendChild(createThemePicker())
  }

  // Set up event listeners
  setupFileUpload()
  setupActionButtons()

  return toolbar
}

function setupFileUpload(): void {
  const fileInput = document.getElementById('file-input') as HTMLInputElement | null
  if (!fileInput) return

  fileInput.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
    target.value = ''
  })
}

function setupActionButtons(): void {
  const copyBtn = document.getElementById('copy-html-btn')
  const printBtn = document.getElementById('print-btn')
  const exportPdfBtn = document.getElementById('export-pdf-btn')

  copyBtn?.addEventListener('click', handleCopyHtml)
  printBtn?.addEventListener('click', handlePrint)
  exportPdfBtn?.addEventListener('click', handleExportPdf)
}

export function handleFileUpload(file: File): void {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()

  if (!VALID_EXTENSIONS.includes(extension)) {
    showToast(`Invalid file type. Please upload ${VALID_EXTENSIONS.join(', ')} files.`, 'error')
    return
  }

  if (file.size > MAX_FILE_SIZE) {
    showToast('File too large. Maximum size is 25MB.', 'error')
    return
  }

  const reader = new FileReader()

  reader.onload = (e) => {
    const content = e.target?.result as string
    setState({ markdown: content })
    showToast(`Loaded: ${file.name}`, 'success')
  }

  reader.onerror = () => {
    showToast('Failed to read file. Please try again.', 'error')
  }

  reader.readAsText(file)
}

function handleCopyHtml(): void {
  const previewContainer = document.getElementById('preview-container')
  const shadowHost = previewContainer?.querySelector('.preview-shadow-host') as HTMLElement | null
  const shadowRoot = shadowHost?.shadowRoot
  const contentElement = shadowRoot?.querySelector('.preview-content')

  if (!contentElement) {
    showToast('No content to copy', 'error')
    return
  }

  const html = contentElement.innerHTML

  navigator.clipboard.writeText(html).then(
    () => showToast('HTML copied to clipboard', 'success'),
    () => showToast('Failed to copy HTML', 'error')
  )
}

function handlePrint(): void {
  const previewContainer = document.getElementById('preview-container')
  const shadowHost = previewContainer?.querySelector('.preview-shadow-host') as HTMLElement | null
  const shadowRoot = shadowHost?.shadowRoot
  const contentElement = shadowRoot?.querySelector('.preview-content')
  const themeStylesheet = shadowRoot?.querySelector('style')?.textContent || ''

  if (!contentElement) {
    showToast('No content to print', 'error')
    return
  }

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    showToast('Please allow popups to print', 'error')
    return
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>print-mark</title>
      <style>${themeStylesheet}</style>
    </head>
    <body class="print-document">
      ${contentElement.innerHTML}
    </body>
    </html>
  `)

  printWindow.document.close()
  printWindow.focus()

  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 250)
}

function handleExportPdf(): void {
  const btn = document.getElementById('export-pdf-btn')

  if (btn?.classList.contains('loading')) return

  const state = getState()
  if (!state.markdown.trim()) {
    showToast('No content to export', 'error')
    return
  }

  btn?.classList.add('loading')

  // PDF export will be implemented in Phase 5
  // For now, show a placeholder message
  setTimeout(() => {
    btn?.classList.remove('loading')
    showToast('PDF export coming soon!', 'info')
  }, 1000)
}

// Drag and Drop
let dragCounter = 0

export function initDragAndDrop(): void {
  document.addEventListener('dragenter', handleDragEnter)
  document.addEventListener('dragleave', handleDragLeave)
  document.addEventListener('dragover', handleDragOver)
  document.addEventListener('drop', handleDrop)
}

function handleDragEnter(e: DragEvent): void {
  e.preventDefault()
  dragCounter++

  if (dragCounter === 1) {
    showDragOverlay()
  }
}

function handleDragLeave(e: DragEvent): void {
  e.preventDefault()
  dragCounter--

  if (dragCounter === 0) {
    hideDragOverlay()
  }
}

function handleDragOver(e: DragEvent): void {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy'
  }
}

function handleDrop(e: DragEvent): void {
  e.preventDefault()
  dragCounter = 0
  hideDragOverlay()

  const file = e.dataTransfer?.files[0]
  if (file) {
    handleFileUpload(file)
  }
}

function showDragOverlay(): void {
  if (document.querySelector('.drag-overlay')) return

  const overlay = document.createElement('div')
  overlay.className = 'drag-overlay'
  overlay.innerHTML = `
    <div class="drag-overlay-content">
      <h2>Drop your file here</h2>
      <p>Supported: .md, .markdown, .txt</p>
    </div>
  `
  document.body.appendChild(overlay)
}

function hideDragOverlay(): void {
  document.querySelector('.drag-overlay')?.remove()
}
