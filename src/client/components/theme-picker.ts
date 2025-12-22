import { getState, setState, subscribe } from '../state.js'
import type { ThemeId } from '../../shared/types.js'

export function createThemePicker(): HTMLElement {
  const container = document.createElement('div')
  container.className = 'theme-picker'

  const label = document.createElement('label')
  label.className = 'theme-picker-label'
  label.textContent = 'Theme'
  label.id = 'theme-picker-label'
  label.setAttribute('for', 'theme-select')

  const select = document.createElement('select')
  select.className = 'theme-picker-select'
  select.id = 'theme-select'
  select.setAttribute('aria-labelledby', 'theme-picker-label')

  container.appendChild(label)
  container.appendChild(select)

  // Update options when themes are loaded
  const updateOptions = () => {
    const state = getState()
    select.innerHTML = ''

    if (state.themes.length === 0) {
      const loadingOption = document.createElement('option')
      loadingOption.textContent = 'Loading...'
      loadingOption.disabled = true
      select.appendChild(loadingOption)
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

  // Handle theme selection
  select.addEventListener('change', () => {
    const themeId = select.value as ThemeId
    setState({ themeId })
    window.dispatchEvent(new CustomEvent('themechange', { detail: { themeId } }))
  })

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

  return container
}
