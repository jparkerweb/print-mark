import MarkdownIt from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItTaskLists from 'markdown-it-task-lists'
import markdownItFootnote from 'markdown-it-footnote'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import markdown from 'highlight.js/lib/languages/markdown'
import yaml from 'highlight.js/lib/languages/yaml'
import sql from 'highlight.js/lib/languages/sql'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import DOMPurify from 'isomorphic-dompurify'
import {
  defaultMarkdownConfig,
  anchorOptions,
} from '../../shared/markdown-config'
import { sanitizeConfig } from '../../shared/sanitize-config'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('py', python)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('md', markdown)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('yml', yaml)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('go', go)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('rs', rust)

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function highlightCode(code: string, lang: string): string {
  if (!lang) {
    try {
      const result = hljs.highlightAuto(code)
      return `<pre><code class="hljs">${result.value}</code></pre>`
    } catch {
      return `<pre><code>${escapeHtml(code)}</code></pre>`
    }
  }

  const normalizedLang = lang.toLowerCase()

  try {
    if (hljs.getLanguage(normalizedLang)) {
      const result = hljs.highlight(code, { language: normalizedLang })
      return `<pre><code class="hljs language-${escapeHtml(normalizedLang)}">${result.value}</code></pre>`
    }
  } catch {
    // Fall through to escaped output
  }

  return `<pre><code class="language-${escapeHtml(lang)}">${escapeHtml(code)}</code></pre>`
}

const md = new MarkdownIt({
  ...defaultMarkdownConfig,
  highlight: highlightCode,
})

md.use(markdownItAnchor, anchorOptions)
md.use(markdownItTaskLists, { enabled: true, label: true })
md.use(markdownItFootnote)

export function render(markdown: string): string {
  return md.render(markdown)
}

export function renderSanitized(markdown: string): string {
  const html = render(markdown)
  return DOMPurify.sanitize(html, sanitizeConfig) as string
}
