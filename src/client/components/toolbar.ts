import { setState, getState, subscribe } from '../state.js'
import { createThemePicker } from './theme-picker.js'
import { showToast } from './toast.js'
import { exportPDF, downloadBlob } from '../services/api.js'
import type { PDFOptions } from '../../shared/types.js'

// PDF options stored in localStorage
const PDF_OPTIONS_KEY = 'print-mark-pdf-options'

function getPDFOptions(): PDFOptions {
  try {
    const stored = localStorage.getItem(PDF_OPTIONS_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore parse errors
  }
  return {
    pageSize: 'A4',
    margins: 'normal',
    includePageNumbers: true,
  }
}

function savePDFOptions(options: PDFOptions): void {
  localStorage.setItem(PDF_OPTIONS_KEY, JSON.stringify(options))
}

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB
const VALID_EXTENSIONS = ['.md', '.markdown', '.txt']

export function createToolbar(): HTMLElement {
  const toolbar = document.getElementById('toolbar')
  if (!toolbar) throw new Error('Toolbar container not found')

  toolbar.innerHTML = `
    <div class="toolbar-left">
      <a href="/" class="toolbar-logo" aria-label="print-mark home">
        <span class="toolbar-logo-icon" aria-hidden="true">\u{1F4C4}</span>
        <span>print-mark</span>
      </a>
      <div class="toolbar-divider" aria-hidden="true"></div>
      <label class="upload-btn">
        <span class="upload-btn-icon" aria-hidden="true">\u{1F4C1}</span>
        <span>Open File</span>
        <input type="file" accept=".md,.markdown,.txt" class="visually-hidden" id="file-input" aria-label="Upload markdown file" />
      </label>
    </div>
    <div class="toolbar-center" id="theme-picker-container" role="group" aria-label="Theme selection"></div>
    <div class="toolbar-right">
      <button type="button" class="toolbar-btn" id="copy-html-btn" aria-label="Copy HTML to clipboard">
        <span class="toolbar-btn-icon" aria-hidden="true">\u{1F4CB}</span>
        <span>Copy HTML</span>
      </button>
      <button type="button" class="toolbar-btn" id="print-btn" aria-label="Print document">
        <span class="toolbar-btn-icon" aria-hidden="true">\u{1F5A8}</span>
        <span>Print</span>
      </button>
      <div class="pdf-options-group" role="group" aria-label="PDF export options">
        <select id="pdf-page-size" class="pdf-option-select" title="Page size" aria-label="PDF page size">
          <option value="A4">A4</option>
          <option value="Letter" selected>Letter</option>
          <option value="Legal">Legal</option>
        </select>
        <select id="pdf-margins" class="pdf-option-select" title="Margins" aria-label="PDF margins">
          <option value="normal">Normal</option>
          <option value="narrow">Narrow</option>
          <option value="wide">Wide</option>
        </select>
        <label class="pdf-option-checkbox" title="Include page numbers">
          <input type="checkbox" id="pdf-page-numbers" checked aria-label="Include page numbers in PDF" />
          <span aria-hidden="true">#</span>
        </label>
      </div>
      <button type="button" class="toolbar-btn toolbar-btn-primary" id="export-pdf-btn" aria-label="Export to PDF">
        <span class="toolbar-btn-icon" aria-hidden="true">\u{1F4E5}</span>
        <span>Export PDF</span>
      </button>
    </div>
  `

  // Initialize theme picker
  const themePickerContainer = toolbar.querySelector('#theme-picker-container')
  if (themePickerContainer) {
    themePickerContainer.appendChild(createThemePicker())
  }

  // Initialize PDF options from localStorage
  initializePDFOptions()

  // Set up event listeners
  setupFileUpload()
  setupActionButtons()
  setupPDFOptionsListeners()

  return toolbar
}

function initializePDFOptions(): void {
  const options = getPDFOptions()

  const pageSizeSelect = document.getElementById('pdf-page-size') as HTMLSelectElement | null
  const marginsSelect = document.getElementById('pdf-margins') as HTMLSelectElement | null
  const pageNumbersCheckbox = document.getElementById('pdf-page-numbers') as HTMLInputElement | null

  if (pageSizeSelect) pageSizeSelect.value = options.pageSize
  if (marginsSelect) marginsSelect.value = options.margins
  if (pageNumbersCheckbox) pageNumbersCheckbox.checked = options.includePageNumbers
}

function setupPDFOptionsListeners(): void {
  const pageSizeSelect = document.getElementById('pdf-page-size') as HTMLSelectElement | null
  const marginsSelect = document.getElementById('pdf-margins') as HTMLSelectElement | null
  const pageNumbersCheckbox = document.getElementById('pdf-page-numbers') as HTMLInputElement | null

  const saveOptions = () => {
    const options: PDFOptions = {
      pageSize: (pageSizeSelect?.value as PDFOptions['pageSize']) || 'A4',
      margins: (marginsSelect?.value as PDFOptions['margins']) || 'normal',
      includePageNumbers: pageNumbersCheckbox?.checked ?? true,
    }
    savePDFOptions(options)
  }

  pageSizeSelect?.addEventListener('change', saveOptions)
  marginsSelect?.addEventListener('change', saveOptions)
  pageNumbersCheckbox?.addEventListener('change', saveOptions)
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

  printWindow.onload = () => {
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }
}

async function handleExportPdf(): Promise<void> {
  const btn = document.getElementById('export-pdf-btn')

  if (btn?.classList.contains('loading')) return

  const state = getState()
  if (!state.markdown.trim()) {
    showToast('No content to export', 'error')
    return
  }

  btn?.classList.add('loading')

  try {
    const options = getPDFOptions()
    const blob = await exportPDF(state.markdown, state.themeId, options)
    downloadBlob(blob, 'document.pdf')
    showToast('PDF exported successfully', 'success')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to export PDF'
    showToast(message, 'error')
  } finally {
    btn?.classList.remove('loading')
  }
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
