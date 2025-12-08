import type { Theme, ThemeId } from '../shared/types.js'

export interface AppState {
  markdown: string
  themeId: ThemeId
  themes: Theme[]
  isLoading: boolean
}

type Listener = (state: AppState, prevState: AppState) => void

const initialState: AppState = {
  markdown: '',
  themeId: 'clean',
  themes: [],
  isLoading: true,
}

let state: AppState = { ...initialState }
const listeners: Set<Listener> = new Set()

export function getState(): Readonly<AppState> {
  return state
}

export function setState(partial: Partial<AppState>): void {
  const prevState = state
  state = { ...state, ...partial }
  listeners.forEach((listener) => listener(state, prevState))
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function resetState(): void {
  setState({ ...initialState })
}
