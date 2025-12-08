import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view'
import { markdown } from '@codemirror/lang-markdown'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'
import { setState, getState, subscribe } from '../state.js'
import { defaultMarkdownContent } from './default-content.js'

let editorView: EditorView | null = null
let debounceTimeout: number | null = null
const DEBOUNCE_MS = 300

export function createEditor(container: HTMLElement, initialContent?: string): EditorView {
  const content = initialContent ?? defaultMarkdownContent

  const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      debouncedUpdate(update.state.doc.toString())
    }
  })

  const state = EditorState.create({
    doc: content,
    extensions: [
      lineNumbers(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      history(),
      markdown(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      highlightSelectionMatches(),
      keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
      EditorView.lineWrapping,
      updateListener,
      EditorView.theme({
        '&': {
          height: '100%',
        },
      }),
    ],
  })

  editorView = new EditorView({
    state,
    parent: container,
  })

  // Set initial state
  setState({ markdown: content })

  // Subscribe to external state changes (e.g., file upload)
  subscribe((state, prevState) => {
    if (state.markdown !== prevState.markdown && editorView) {
      const currentContent = editorView.state.doc.toString()
      if (currentContent !== state.markdown) {
        setEditorContent(state.markdown)
      }
    }
  })

  return editorView
}

function debouncedUpdate(content: string): void {
  if (debounceTimeout !== null) {
    clearTimeout(debounceTimeout)
  }

  debounceTimeout = window.setTimeout(() => {
    setState({ markdown: content })
    debounceTimeout = null
  }, DEBOUNCE_MS)
}

export function setEditorContent(content: string): void {
  if (!editorView) return

  const transaction = editorView.state.update({
    changes: {
      from: 0,
      to: editorView.state.doc.length,
      insert: content,
    },
  })

  editorView.dispatch(transaction)
}

export function getEditorContent(): string {
  return editorView?.state.doc.toString() ?? ''
}

export function focusEditor(): void {
  editorView?.focus()
}
