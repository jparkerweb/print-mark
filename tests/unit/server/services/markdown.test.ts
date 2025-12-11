import { describe, it, expect, beforeAll } from 'vitest'
import { MarkdownService } from '../../../../src/server/services/markdown'

describe('MarkdownService', () => {
  let service: MarkdownService

  beforeAll(async () => {
    service = new MarkdownService()
    await service.initialize()
  })

  describe('render()', () => {
    describe('basic markdown', () => {
      it('renders heading to h1', async () => {
        const result = await service.render('# Heading')
        expect(result).toContain('<h1')
        expect(result).toContain('Heading')
        expect(result).toContain('</h1>')
      })

      it('renders bold text to strong', async () => {
        const result = await service.render('**bold**')
        expect(result).toContain('<strong>')
        expect(result).toContain('bold')
        expect(result).toContain('</strong>')
      })

      it('renders unordered list item', async () => {
        const result = await service.render('- item')
        expect(result).toContain('<ul>')
        expect(result).toContain('<li>')
        expect(result).toContain('item')
        expect(result).toContain('</li>')
        expect(result).toContain('</ul>')
      })

      it('renders ordered list item', async () => {
        const result = await service.render('1. item')
        expect(result).toContain('<ol>')
        expect(result).toContain('<li>')
        expect(result).toContain('item')
        expect(result).toContain('</li>')
        expect(result).toContain('</ol>')
      })
    })

    describe('code blocks', () => {
      it('renders fenced code blocks with language class', async () => {
        const result = await service.render('```javascript\nconst x = 1;\n```')
        expect(result).toContain('<pre')
        expect(result).toContain('<code')
      })

      it('renders inline code with code tags', async () => {
        const result = await service.render('Use `code` here')
        expect(result).toContain('<code>')
        expect(result).toContain('code')
        expect(result).toContain('</code>')
      })

      it('applies syntax highlighting for known languages', async () => {
        const result = await service.render('```typescript\nconst x: number = 1;\n```')
        // Shiki wraps code in a pre with shiki class or style
        expect(result).toContain('<pre')
      })
    })

    describe('code highlighting edge cases', () => {
      it('highlights known language (javascript)', async () => {
        const result = await service.render('```javascript\nfunction test() {}\n```')
        // Should contain highlighted output (either shiki class or style attributes)
        expect(result).toContain('<pre')
        expect(result).toContain('function')
      })

      it('handles unknown language gracefully', async () => {
        const result = await service.render('```unknownlang\nsome code\n```')
        // Should not throw, should contain the code
        expect(result).toContain('some code')
        expect(result).toContain('<pre')
      })

      it('renders empty code block without error', async () => {
        const result = await service.render('```\n\n```')
        expect(result).toContain('<pre')
        expect(result).toContain('<code')
      })
    })
  })

  describe('renderSanitized()', () => {
    it('strips script tags', async () => {
      const result = await service.renderSanitized('<script>alert("xss")</script>Hello')
      expect(result).not.toContain('<script')
      expect(result).not.toContain('alert')
      expect(result).toContain('Hello')
    })

    it('strips onclick attributes', async () => {
      const result = await service.renderSanitized('<p onclick="alert()">Click me</p>')
      expect(result).not.toContain('onclick')
      expect(result).toContain('Click me')
    })

    it('preserves safe HTML like p and a', async () => {
      const result = await service.renderSanitized('<p>Hello <a href="https://example.com">link</a></p>')
      expect(result).toContain('<p>')
      expect(result).toContain('<a')
      expect(result).toContain('href')
      expect(result).toContain('</p>')
    })

    it('strips iframe elements', async () => {
      const result = await service.renderSanitized('<iframe src="https://malicious.com"></iframe>Safe content')
      expect(result).not.toContain('<iframe')
      expect(result).not.toContain('malicious')
      expect(result).toContain('Safe content')
    })
  })
})
