import { getState, setState, subscribe } from '../state.js'
import type { ThemeId } from '../../shared/types.js'

export function createThemePicker(): HTMLElement {
  const container = document.createElement('div')
  container.className = 'theme-picker'

  const label = document.createElement('span')
  label.className = 'theme-picker-label'
  label.textContent = 'Theme:'

  const select = document.createElement('select')
  select.className = 'theme-picker-select'
  select.id = 'theme-select'
  select.setAttribute('aria-label', 'Select theme')

  container.appendChild(label)
  container.appendChild(select)

  // Update options when themes are loaded
  const updateOptions = () => {
    const state = getState()
    select.innerHTML = ''

    if (state.themes.length === 0) {
      const option = document.createElement('option')
      option.value = ''
      option.textContent = 'Loading...'
      option.disabled = true
      select.appendChild(option)
      return
    }

    state.themes.forEach((theme) => {
      const option = document.createElement('option')
      option.value = theme.id
      option.textContent = theme.name
      option.title = theme.description
      if (theme.id === state.themeId) {
        option.selected = true
      }
      select.appendChild(option)
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
      select.value = state.themeId
    }
  })

  // Handle selection changes
  select.addEventListener('change', (e) => {
    const target = e.target as HTMLSelectElement
    const themeId = target.value as ThemeId
    setState({ themeId })

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('themechange', { detail: { themeId } }))
  })

  return container
}
