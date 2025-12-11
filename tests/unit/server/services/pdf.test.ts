import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Mock } from 'vitest'

// Define mock objects at the module level so they can be accessed in tests
const mockPage = {
  setViewport: vi.fn().mockResolvedValue(undefined),
  setContent: vi.fn().mockResolvedValue(undefined),
  pdf: vi.fn().mockResolvedValue(Buffer.from('%PDF-1.4 mock')),
  close: vi.fn().mockResolvedValue(undefined),
}

const mockBrowser = {
  newPage: vi.fn().mockResolvedValue(mockPage),
  close: vi.fn().mockResolvedValue(undefined),
  on: vi.fn(),
}

// Mock puppeteer module - factory cannot reference external variables
vi.mock('puppeteer', () => ({
  default: {
    launch: vi.fn(),
  },
}))

// Mock the markdown service
vi.mock('../../../../src/server/services/markdown', () => ({
  markdownService: {
    renderSanitized: vi.fn().mockResolvedValue('<p>Rendered markdown</p>'),
  },
}))

// Mock the theme service
vi.mock('../../../../src/server/services/themes', () => ({
  themeService: {
    getThemeCSS: vi.fn().mockResolvedValue('body { color: black; }'),
  },
}))

describe('PDFService', () => {
  let service: InstanceType<typeof import('../../../../src/server/services/pdf').PDFService>
  let puppeteerModule: { default: { launch: Mock } }

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks()

    // Reset mock implementations
    mockPage.setViewport.mockResolvedValue(undefined)
    mockPage.setContent.mockResolvedValue(undefined)
    mockPage.pdf.mockResolvedValue(Buffer.from('%PDF-1.4 mock'))
    mockPage.close.mockResolvedValue(undefined)
    mockBrowser.newPage.mockResolvedValue(mockPage)
    mockBrowser.close.mockResolvedValue(undefined)

    // Import mocked puppeteer and set up launch mock
    puppeteerModule = await import('puppeteer') as { default: { launch: Mock } }
    puppeteerModule.default.launch.mockResolvedValue(mockBrowser)

    // Import PDFService fresh for each test
    const { PDFService } = await import('../../../../src/server/services/pdf')
    service = new PDFService()
  })

  afterEach(async () => {
    await service.closeBrowser()
    vi.resetModules()
  })

  describe('generatePDF()', () => {
    const defaultRequest = {
      markdown: '# Test',
      theme: 'clean' as const,
      options: {
        pageSize: 'A4' as const,
        margins: 'normal' as const,
        includePageNumbers: false,
      },
    }

    it('calls browser.newPage()', async () => {
      await service.generatePDF(defaultRequest)
      expect(mockBrowser.newPage).toHaveBeenCalled()
    })

    it('calls page.setContent() with HTML', async () => {
      await service.generatePDF(defaultRequest)
      expect(mockPage.setContent).toHaveBeenCalled()

      const [html] = mockPage.setContent.mock.calls[0]
      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('<html')
      expect(html).toContain('</html>')
    })

    it('calls page.pdf() with options', async () => {
      await service.generatePDF(defaultRequest)
      expect(mockPage.pdf).toHaveBeenCalled()

      const [pdfOptions] = mockPage.pdf.mock.calls[0]
      expect(pdfOptions.format).toBe('A4')
      expect(pdfOptions.printBackground).toBe(true)
    })

    it('returns Buffer from mock', async () => {
      const result = await service.generatePDF(defaultRequest)
      expect(Buffer.isBuffer(result)).toBe(true)
    })

    it('closes page after generation', async () => {
      await service.generatePDF(defaultRequest)
      expect(mockPage.close).toHaveBeenCalled()
    })

    it('sets viewport with correct page width', async () => {
      await service.generatePDF(defaultRequest)
      expect(mockPage.setViewport).toHaveBeenCalled()
    })
  })

  describe('generateHTMLDocument() - tested via generatePDF', () => {
    const defaultRequest = {
      markdown: '# Test Heading',
      theme: 'clean' as const,
      options: {
        pageSize: 'Letter' as const,
        margins: 'wide' as const,
        includePageNumbers: false,
      },
    }

    it('generates valid HTML string', async () => {
      await service.generatePDF(defaultRequest)

      const [html] = mockPage.setContent.mock.calls[0]
      expect(html).toContain('<!DOCTYPE html>')
    })

    it('includes theme CSS within style tag', async () => {
      await service.generatePDF(defaultRequest)

      const [html] = mockPage.setContent.mock.calls[0]
      expect(html).toContain('<style>')
      expect(html).toContain('</style>')
    })

    it('includes HTML content within body', async () => {
      await service.generatePDF(defaultRequest)

      const [html] = mockPage.setContent.mock.calls[0]
      expect(html).toContain('<body')
      expect(html).toContain('</body>')
      // The rendered markdown content
      expect(html).toContain('Rendered markdown')
    })

    it('includes necessary meta tags', async () => {
      await service.generatePDF(defaultRequest)

      const [html] = mockPage.setContent.mock.calls[0]
      expect(html).toContain('<meta charset="UTF-8">')
      expect(html).toContain('<meta name="viewport"')
    })
  })

  describe('PDF options handling', () => {
    it('handles normal margins', async () => {
      const request = {
        markdown: '# Test',
        theme: 'clean' as const,
        options: {
          pageSize: 'A4' as const,
          margins: 'normal' as const,
          includePageNumbers: false,
        },
      }

      await service.generatePDF(request)

      const [pdfOptions] = mockPage.pdf.mock.calls[0]
      expect(pdfOptions.margin.top).toBe('20mm')
    })

    it('handles narrow margins', async () => {
      const request = {
        markdown: '# Test',
        theme: 'clean' as const,
        options: {
          pageSize: 'A4' as const,
          margins: 'narrow' as const,
          includePageNumbers: false,
        },
      }

      await service.generatePDF(request)

      const [pdfOptions] = mockPage.pdf.mock.calls[0]
      expect(pdfOptions.margin.top).toBe('10mm')
    })

    it('handles wide margins', async () => {
      const request = {
        markdown: '# Test',
        theme: 'clean' as const,
        options: {
          pageSize: 'A4' as const,
          margins: 'wide' as const,
          includePageNumbers: false,
        },
      }

      await service.generatePDF(request)

      const [pdfOptions] = mockPage.pdf.mock.calls[0]
      expect(pdfOptions.margin.top).toBe('25mm')
    })

    it('handles A4 page size', async () => {
      const request = {
        markdown: '# Test',
        theme: 'clean' as const,
        options: {
          pageSize: 'A4' as const,
          margins: 'normal' as const,
          includePageNumbers: false,
        },
      }

      await service.generatePDF(request)

      const [pdfOptions] = mockPage.pdf.mock.calls[0]
      expect(pdfOptions.format).toBe('A4')
    })

    it('handles Letter page size', async () => {
      const request = {
        markdown: '# Test',
        theme: 'clean' as const,
        options: {
          pageSize: 'Letter' as const,
          margins: 'normal' as const,
          includePageNumbers: false,
        },
      }

      await service.generatePDF(request)

      const [pdfOptions] = mockPage.pdf.mock.calls[0]
      expect(pdfOptions.format).toBe('Letter')
    })

    it('handles Legal page size', async () => {
      const request = {
        markdown: '# Test',
        theme: 'clean' as const,
        options: {
          pageSize: 'Legal' as const,
          margins: 'normal' as const,
          includePageNumbers: false,
        },
      }

      await service.generatePDF(request)

      const [pdfOptions] = mockPage.pdf.mock.calls[0]
      expect(pdfOptions.format).toBe('Legal')
    })

    it('applies default options when generating PDF', async () => {
      const request = {
        markdown: '# Test',
        theme: 'clean' as const,
        options: {
          pageSize: 'A4' as const,
          margins: 'normal' as const,
          includePageNumbers: false,
        },
      }

      await service.generatePDF(request)

      const [pdfOptions] = mockPage.pdf.mock.calls[0]
      expect(pdfOptions.printBackground).toBe(true)
    })

    it('handles page numbers option', async () => {
      const request = {
        markdown: '# Test',
        theme: 'clean' as const,
        options: {
          pageSize: 'A4' as const,
          margins: 'normal' as const,
          includePageNumbers: true,
        },
      }

      await service.generatePDF(request)

      const [pdfOptions] = mockPage.pdf.mock.calls[0]
      expect(pdfOptions.displayHeaderFooter).toBe(true)
      expect(pdfOptions.footerTemplate).toContain('pageNumber')
    })
  })

  describe('closeBrowser()', () => {
    it('closes browser when called', async () => {
      // First generate a PDF to ensure browser is created
      await service.generatePDF({
        markdown: '# Test',
        theme: 'clean' as const,
        options: {
          pageSize: 'A4' as const,
          margins: 'normal' as const,
          includePageNumbers: false,
        },
      })

      await service.closeBrowser()
      expect(mockBrowser.close).toHaveBeenCalled()
    })

    it('does not throw if browser not initialized', async () => {
      // closeBrowser should not throw when browser is not initialized
      await expect(service.closeBrowser()).resolves.not.toThrow()
    })
  })
})
