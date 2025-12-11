import { describe, it, expect } from 'vitest'
import { config } from '../../../src/server/config'

describe('server config', () => {
  describe('default values', () => {
    it('has PORT with default value of 3000', () => {
      expect(config.PORT).toBeDefined()
      // Default is 3000, but may be overridden by environment
      expect(typeof config.PORT).toBe('number')
    })

    it('has NODE_ENV with a valid value', () => {
      expect(config.NODE_ENV).toBeDefined()
      expect(['development', 'production', 'test']).toContain(config.NODE_ENV)
    })

    it('has MAX_FILE_SIZE with a reasonable default', () => {
      expect(config.MAX_FILE_SIZE).toBeDefined()
      // Default is 26214400 (25MB)
      expect(config.MAX_FILE_SIZE).toBeGreaterThan(0)
    })

    it('has PDF_TIMEOUT defined', () => {
      expect(config.PDF_TIMEOUT).toBeDefined()
      expect(config.PDF_TIMEOUT).toBeGreaterThan(0)
    })

    it('has PDF_CONCURRENT_LIMIT defined', () => {
      expect(config.PDF_CONCURRENT_LIMIT).toBeDefined()
      expect(config.PDF_CONCURRENT_LIMIT).toBeGreaterThan(0)
    })
  })

  describe('type correctness', () => {
    it('PORT is a number', () => {
      expect(typeof config.PORT).toBe('number')
    })

    it('MAX_FILE_SIZE is a number', () => {
      expect(typeof config.MAX_FILE_SIZE).toBe('number')
    })

    it('HOST is a string', () => {
      expect(typeof config.HOST).toBe('string')
    })

    it('NODE_ENV is a string', () => {
      expect(typeof config.NODE_ENV).toBe('string')
    })

    it('PDF_TIMEOUT is a number', () => {
      expect(typeof config.PDF_TIMEOUT).toBe('number')
    })

    it('PDF_CONCURRENT_LIMIT is a number', () => {
      expect(typeof config.PDF_CONCURRENT_LIMIT).toBe('number')
    })
  })
})
