import { getState, setState, subscribe } from '../state.js'
import type { ThemeId } from '../../shared/types.js'

// Theme visual indicators (icons/colors)
const THEME_ICONS: Record<ThemeId, { icon: string; color: string }> = {
  clean: { icon: '○', color: '#3b82f6' },
  academic: { icon: '◆', color: '#8b5cf6' },
  modern: { icon: '■', color: '#10b981' },
  compact: { icon: '▪', color: '#f59e0b' },
}

export function createThemePicker(): HTMLElement {
  const container = document.createElement('div')
  container.className = 'theme-picker'
  container.setAttribute('role', 'radiogroup')
  container.setAttribute('aria-label', 'Select theme')

  const label = document.createElement('span')
  label.className = 'theme-picker-label'
  label.textContent = 'Theme'
  label.id = 'theme-picker-label'
  container.setAttribute('aria-labelledby', 'theme-picker-label')

  const optionsContainer = document.createElement('div')
  optionsContainer.className = 'theme-picker-options'

  container.appendChild(label)
  container.appendChild(optionsContainer)

  // Update options when themes are loaded
  const updateOptions = () => {
    const state = getState()
    optionsContainer.innerHTML = ''

    if (state.themes.length === 0) {
      const loading = document.createElement('span')
      loading.className = 'theme-picker-loading'
      loading.textContent = 'Loading...'
      optionsContainer.appendChild(loading)
      return
    }

    state.themes.forEach((theme) => {
      const themeInfo = THEME_ICONS[theme.id] || { icon: '●', color: '#6b7280' }
      const isSelected = theme.id === state.themeId

      const button = document.createElement('button')
      button.type = 'button'
      button.className = `theme-picker-option${isSelected ? ' theme-picker-option--selected' : ''}`
      button.setAttribute('role', 'radio')
      button.setAttribute('aria-checked', isSelected.toString())
      button.setAttribute('data-theme-id', theme.id)
      button.title = theme.description

      const indicator = document.createElement('span')
      indicator.className = 'theme-picker-indicator'
      indicator.style.setProperty('--theme-color', themeInfo.color)
      indicator.textContent = themeInfo.icon

      const name = document.createElement('span')
      name.className = 'theme-picker-name'
      name.textContent = theme.name

      button.appendChild(indicator)
      button.appendChild(name)
      optionsContainer.appendChild(button)

      button.addEventListener('click', () => {
        const themeId = theme.id as ThemeId
        setState({ themeId })
        window.dispatchEvent(new CustomEvent('themechange', { detail: { themeId } }))
      })
    })
  }

  // Initial render
  updateOptions()

  // Subscribe to state changes
  subscribe((state, prevState) => {
    if (state.themes !== prevState.themes) {
      updateOptions()
    }
    if (state.themeId !== prevState.themeId) {
      // Update selected state
      const buttons = optionsContainer.querySelectorAll('.theme-picker-option')
      buttons.forEach((btn) => {
        const themeId = btn.getAttribute('data-theme-id')
        const isSelected = themeId === state.themeId
        btn.classList.toggle('theme-picker-option--selected', isSelected)
        btn.setAttribute('aria-checked', isSelected.toString())
      })
    }
  })

  return container
}
