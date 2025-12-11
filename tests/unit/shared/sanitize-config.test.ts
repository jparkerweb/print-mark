import { describe, it, expect } from 'vitest'
import { sanitizeConfig } from '../../../src/shared/sanitize-config'

describe('sanitize-config', () => {
  describe('ALLOWED_TAGS', () => {
    const allowedTags = sanitizeConfig.ALLOWED_TAGS as string[]

    it('contains basic safe HTML tags', () => {
      expect(allowedTags).toContain('p')
      expect(allowedTags).toContain('br')
      expect(allowedTags).toContain('h1')
      expect(allowedTags).toContain('h2')
      expect(allowedTags).toContain('h3')
      expect(allowedTags).toContain('h4')
      expect(allowedTags).toContain('h5')
      expect(allowedTags).toContain('h6')
    })

    it('contains list tags', () => {
      expect(allowedTags).toContain('ul')
      expect(allowedTags).toContain('ol')
      expect(allowedTags).toContain('li')
    })

    it('contains inline tags', () => {
      expect(allowedTags).toContain('a')
      expect(allowedTags).toContain('code')
      expect(allowedTags).toContain('pre')
    })

    it('contains table tags', () => {
      expect(allowedTags).toContain('table')
      expect(allowedTags).toContain('thead')
      expect(allowedTags).toContain('tbody')
      expect(allowedTags).toContain('tr')
      expect(allowedTags).toContain('th')
      expect(allowedTags).toContain('td')
    })

    it('contains formatting tags', () => {
      expect(allowedTags).toContain('strong')
      expect(allowedTags).toContain('em')
      expect(allowedTags).toContain('blockquote')
    })
  })

  describe('FORBID_TAGS', () => {
    const forbiddenTags = sanitizeConfig.FORBID_TAGS as string[]

    it('contains script tag', () => {
      expect(forbiddenTags).toContain('script')
    })

    it('contains style tag', () => {
      expect(forbiddenTags).toContain('style')
    })

    it('contains iframe tag', () => {
      expect(forbiddenTags).toContain('iframe')
    })
  })

  describe('ALLOWED_ATTR', () => {
    const allowedAttrs = sanitizeConfig.ALLOWED_ATTR as string[]

    it('contains safe attributes', () => {
      expect(allowedAttrs).toContain('href')
      expect(allowedAttrs).toContain('src')
      expect(allowedAttrs).toContain('alt')
      expect(allowedAttrs).toContain('title')
      expect(allowedAttrs).toContain('class')
      expect(allowedAttrs).toContain('id')
    })

    it('does NOT contain dangerous event handler attributes', () => {
      expect(allowedAttrs).not.toContain('onclick')
      expect(allowedAttrs).not.toContain('onerror')
      expect(allowedAttrs).not.toContain('onload')
      expect(allowedAttrs).not.toContain('onmouseover')
    })
  })
})
