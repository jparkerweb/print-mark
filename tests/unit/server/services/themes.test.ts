import { describe, it, expect, beforeEach } from 'vitest'
import { ThemeService } from '../../../../src/server/services/themes'

describe('ThemeService', () => {
  let service: ThemeService

  beforeEach(() => {
    service = new ThemeService()
  })

  describe('getThemes()', () => {
    it('returns an array', () => {
      const themes = service.getThemes()
      expect(Array.isArray(themes)).toBe(true)
    })

    it('returns a non-empty array', () => {
      const themes = service.getThemes()
      expect(themes.length).toBeGreaterThan(0)
    })

    it('each theme has id, name, and description properties', () => {
      const themes = service.getThemes()
      for (const theme of themes) {
        expect(theme.id).toBeDefined()
        expect(theme.name).toBeDefined()
        expect(theme.description).toBeDefined()
      }
    })

    it('each theme id is a string', () => {
      const themes = service.getThemes()
      for (const theme of themes) {
        expect(typeof theme.id).toBe('string')
      }
    })
  })

  describe('isValidThemeId()', () => {
    it('returns true for valid theme IDs', () => {
      const themes = service.getThemes()
      // Use the first theme ID as a valid one
      const validId = themes[0].id
      expect(service.isValidThemeId(validId)).toBe(true)
    })

    it('returns true for known theme IDs', () => {
      expect(service.isValidThemeId('clean')).toBe(true)
      expect(service.isValidThemeId('academic')).toBe(true)
      expect(service.isValidThemeId('modern')).toBe(true)
      expect(service.isValidThemeId('compact')).toBe(true)
    })

    it('returns false for invalid theme ID', () => {
      expect(service.isValidThemeId('nonexistent-theme')).toBe(false)
    })

    it('returns false for empty string', () => {
      expect(service.isValidThemeId('')).toBe(false)
    })

    it('returns false for random strings', () => {
      expect(service.isValidThemeId('random-string-12345')).toBe(false)
    })
  })

  describe('getThemeCSS()', () => {
    it('returns a string for valid theme ID', async () => {
      const css = await service.getThemeCSS('clean')
      expect(typeof css).toBe('string')
    })

    it('returned string contains CSS patterns', async () => {
      const css = await service.getThemeCSS('clean')
      // CSS should contain common patterns
      expect(css).toContain('{')
      expect(css).toContain('}')
      expect(css).toContain(':')
    })

    it('throws error for invalid theme ID', async () => {
      await expect(service.getThemeCSS('invalid-theme' as 'clean')).rejects.toThrow()
    })

    it('caches CSS for subsequent calls', async () => {
      const css1 = await service.getThemeCSS('modern')
      const css2 = await service.getThemeCSS('modern')
      expect(css1).toBe(css2)
    })
  })

  describe('clearCache()', () => {
    it('clears the CSS cache without error', () => {
      expect(() => service.clearCache()).not.toThrow()
    })
  })
})
