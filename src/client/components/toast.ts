export type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  element: HTMLElement
  timeoutId: number
}

const toasts: Map<number, Toast> = new Map()
let toastId = 0

const icons: Record<ToastType, string> = {
  success: '\u2713',
  error: '\u2717',
  info: '\u2139',
}

export function showToast(message: string, type: ToastType = 'info', duration = 3000): number {
  const container = document.getElementById('toast-container')
  if (!container) return -1

  const id = ++toastId

  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.setAttribute('role', 'alert')
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span class="toast-message">${escapeHtml(message)}</span>
    <button class="toast-close" type="button" aria-label="Dismiss">\u2715</button>
  `

  const closeBtn = toast.querySelector('.toast-close')
  closeBtn?.addEventListener('click', () => dismissToast(id))

  container.appendChild(toast)

  const timeoutId = window.setTimeout(() => dismissToast(id), duration)
  toasts.set(id, { id, element: toast, timeoutId })

  return id
}

export function dismissToast(id: number): void {
  const toast = toasts.get(id)
  if (!toast) return

  clearTimeout(toast.timeoutId)
  toast.element.classList.add('toast-exiting')

  setTimeout(() => {
    toast.element.remove()
    toasts.delete(id)
  }, 150)
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
