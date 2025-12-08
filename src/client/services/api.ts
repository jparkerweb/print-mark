import type { ThemeId, PDFOptions } from '../../shared/types.js'

/**
 * Export markdown content as PDF
 */
export async function exportPDF(
  markdown: string,
  theme: ThemeId,
  options: PDFOptions = {
    pageSize: 'A4',
    margins: 'normal',
    includePageNumbers: true,
  }
): Promise<Blob> {
  const response = await fetch('/api/pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      markdown,
      theme,
      options,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const message = errorData.message || `PDF generation failed (${response.status})`
    throw new Error(message)
  }

  return response.blob()
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Upload a markdown file
 */
export async function uploadFile(file: File): Promise<{ filename: string; content: string; size: number }> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const message = errorData.message || `Upload failed (${response.status})`
    throw new Error(message)
  }

  return response.json()
}
