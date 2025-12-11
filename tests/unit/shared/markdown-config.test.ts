import { describe, it, expect } from 'vitest'
import {
  defaultMarkdownConfig,
  anchorOptions,
  pluginNames,
} from '../../../src/shared/markdown-config'

describe('markdown-config', () => {
  describe('defaultMarkdownConfig', () => {
    it('has html property as boolean', () => {
      expect(defaultMarkdownConfig.html).toBeDefined()
      expect(typeof defaultMarkdownConfig.html).toBe('boolean')
    })

    it('has breaks property as boolean', () => {
      expect(defaultMarkdownConfig.breaks).toBeDefined()
      expect(typeof defaultMarkdownConfig.breaks).toBe('boolean')
    })

    it('has linkify property as boolean', () => {
      expect(defaultMarkdownConfig.linkify).toBeDefined()
      expect(typeof defaultMarkdownConfig.linkify).toBe('boolean')
    })

    it('has typographer property as boolean', () => {
      expect(defaultMarkdownConfig.typographer).toBeDefined()
      expect(typeof defaultMarkdownConfig.typographer).toBe('boolean')
    })
  })

  describe('anchorOptions', () => {
    it('has permalink property configured', () => {
      expect(anchorOptions.permalink).toBeDefined()
    })

    it('has level property as array', () => {
      expect(anchorOptions.level).toBeDefined()
      expect(Array.isArray(anchorOptions.level)).toBe(true)
    })
  })

  describe('pluginNames', () => {
    it('is not empty', () => {
      expect(pluginNames.length).toBeGreaterThan(0)
    })

    it('contains expected plugin names', () => {
      expect(pluginNames).toContain('anchor')
      expect(pluginNames).toContain('task-lists')
      expect(pluginNames).toContain('footnote')
    })
  })
})
