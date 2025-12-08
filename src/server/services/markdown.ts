import MarkdownIt from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItTaskLists from 'markdown-it-task-lists'
import markdownItFootnote from 'markdown-it-footnote'
import { createHighlighter, type Highlighter } from 'shiki'
import { JSDOM } from 'jsdom'
import createDOMPurify from 'dompurify'
import {
  defaultMarkdownConfig,
  anchorOptions,
  type MarkdownItInstance,
} from '../../shared/markdown-config.js'
import { sanitizeConfig } from '../../shared/sanitize-config.js'

type DOMPurifyInstance = ReturnType<typeof createDOMPurify>

const SHIKI_THEMES = ['github-light', 'github-dark'] as const
const SHIKI_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'bash',
  'json',
  'html',
  'css',
  'markdown',
  'yaml',
  'sql',
  'go',
  'rust',
] as const

export class MarkdownService {
  private md: MarkdownItInstance | null = null
  private highlighter: Highlighter | null = null
  private initPromise: Promise<void> | null = null
  private purify: DOMPurifyInstance | null = null

  async initialize(): Promise<void> {
    if (this.md) return
    if (this.initPromise) return this.initPromise

    this.initPromise = this.doInitialize()
    return this.initPromise
  }

  private async doInitialize(): Promise<void> {
    await this.initHighlighter()
    this.initMarkdownIt()
    this.initDOMPurify()
  }

  private async initHighlighter(): Promise<void> {
    this.highlighter = await createHighlighter({
      themes: [...SHIKI_THEMES],
      langs: [...SHIKI_LANGUAGES],
    })
  }

  private initMarkdownIt(): void {
    this.md = new MarkdownIt({
      ...defaultMarkdownConfig,
      highlight: (code: string, lang: string): string => {
        return this.highlightCode(code, lang)
      },
    })

    this.md.use(markdownItAnchor, anchorOptions)
    this.md.use(markdownItTaskLists, { enabled: true, label: true })
    this.md.use(markdownItFootnote)
  }

  private initDOMPurify(): void {
    const dom = new JSDOM('')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.purify = createDOMPurify(dom.window as any)
  }

  private highlightCode(code: string, lang: string): string {
    if (!this.highlighter) {
      return this.escapeHtml(code)
    }

    const normalizedLang = lang.toLowerCase()

    try {
      const loadedLangs = this.highlighter.getLoadedLanguages()
      if (!loadedLangs.includes(normalizedLang as (typeof loadedLangs)[number])) {
        return `<pre><code class="language-${this.escapeHtml(lang)}">${this.escapeHtml(code)}</code></pre>`
      }

      return this.highlighter.codeToHtml(code, {
        lang: normalizedLang,
        theme: 'github-light',
      })
    } catch {
      return `<pre><code class="language-${this.escapeHtml(lang)}">${this.escapeHtml(code)}</code></pre>`
    }
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  async render(markdown: string): Promise<string> {
    await this.initialize()
    if (!this.md) {
      throw new Error('Markdown service not initialized')
    }
    return this.md.render(markdown)
  }

  async renderSanitized(markdown: string): Promise<string> {
    const html = await this.render(markdown)
    if (!this.purify) {
      throw new Error('DOMPurify not initialized')
    }
    return this.purify.sanitize(html, sanitizeConfig) as string
  }
}

export const markdownService = new MarkdownService()
