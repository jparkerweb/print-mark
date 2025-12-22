import puppeteer, { Browser, Page } from 'puppeteer'
import { config } from '../config.js'
import { markdownService } from './markdown.js'
import { themeService } from './themes.js'
import type { PDFRequest, PDFOptions } from '../../shared/types.js'

/**
 * Margin presets in millimeters
 */
const MARGIN_PRESETS: Record<PDFOptions['margins'], string> = {
  normal: '20mm',
  narrow: '10mm',
  wide: '25mm',
}

/**
 * Page size configurations
 */
const PAGE_SIZES: Record<PDFOptions['pageSize'], { width: number; height?: number }> = {
  A4: { width: 794 }, // 210mm at 96dpi
  Letter: { width: 816 }, // 8.5in at 96dpi
  Legal: { width: 816 }, // 8.5in at 96dpi
  B5: { width: 672, height: 945 }, // 176mm x 250mm at 96dpi (B5 needs explicit dimensions)
}

/**
 * PDFService handles server-side PDF generation using Puppeteer
 */
export class PDFService {
  private browser: Browser | null = null
  private browserPromise: Promise<Browser> | null = null
  private activeRequests = 0
  private requestQueue: Array<{
    resolve: () => void
    reject: (error: Error) => void
  }> = []

  /**
   * Get or create the browser instance (lazy initialization)
   */
  private async getBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser
    }

    if (this.browserPromise) {
      return this.browserPromise
    }

    const launchOptions: Parameters<typeof puppeteer.launch>[0] = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    }

    // Use system Chromium if PUPPETEER_EXECUTABLE_PATH is set (Docker environment)
    if (config.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = config.PUPPETEER_EXECUTABLE_PATH
    }

    this.browserPromise = puppeteer.launch(launchOptions)

    this.browser = await this.browserPromise
    this.browserPromise = null

    // Handle browser disconnection
    this.browser.on('disconnected', () => {
      this.browser = null
    })

    return this.browser
  }

  /**
   * Close the browser instance
   */
  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  /**
   * Acquire a lock for concurrent request limiting
   */
  private async acquireLock(): Promise<void> {
    if (this.activeRequests < config.PDF_CONCURRENT_LIMIT) {
      this.activeRequests++
      return
    }

    // Queue limit to prevent memory issues
    const maxQueueSize = config.PDF_CONCURRENT_LIMIT * 2
    if (this.requestQueue.length >= maxQueueSize) {
      throw new Error('Too many pending PDF requests. Please try again later.')
    }

    return new Promise((resolve, reject) => {
      this.requestQueue.push({ resolve, reject })
    })
  }

  /**
   * Release a lock and process queued requests
   */
  private releaseLock(): void {
    this.activeRequests--

    if (this.requestQueue.length > 0 && this.activeRequests < config.PDF_CONCURRENT_LIMIT) {
      const next = this.requestQueue.shift()
      if (next) {
        this.activeRequests++
        next.resolve()
      }
    }
  }

  /**
   * Generate HTML document for PDF rendering
   */
  private generateHTMLDocument(content: string, themeCSS: string, options: PDFOptions): string {
    const margin = MARGIN_PRESETS[options.margins]

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Page setup */
    @page {
      size: ${options.pageSize};
      margin: ${margin};
    }

    /* Reset and base styles */
    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* Theme CSS */
    ${themeCSS}

    /* PDF-specific adjustments */
    img {
      max-width: 100%;
      height: auto;
    }

    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    table {
      page-break-inside: avoid;
    }

    h1, h2, h3, h4, h5, h6 {
      page-break-after: avoid;
    }

    p, blockquote {
      orphans: 3;
      widows: 3;
    }
  </style>
</head>
<body class="print-document">
  ${content}
</body>
</html>`
  }

  /**
   * Wrap a promise with a timeout
   */
  private async withTimeout<T>(
    promise: Promise<T>,
    ms: number,
    errorMessage: string
  ): Promise<T> {
    let timeoutId: NodeJS.Timeout

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(errorMessage))
      }, ms)
    })

    try {
      const result = await Promise.race([promise, timeoutPromise])
      clearTimeout(timeoutId!)
      return result
    } catch (error) {
      clearTimeout(timeoutId!)
      throw error
    }
  }

  /**
   * Generate a PDF from markdown content
   */
  async generatePDF(request: PDFRequest): Promise<Buffer> {
    await this.acquireLock()

    let page: Page | null = null

    try {
      // Render markdown to HTML
      const htmlContent = await markdownService.renderSanitized(request.markdown)

      // Get theme CSS
      const themeCSS = await themeService.getThemeCSS(request.theme)

      // Generate complete HTML document
      const html = this.generateHTMLDocument(htmlContent, themeCSS, request.options)

      // Get browser and create page
      const browser = await this.getBrowser()
      page = await browser.newPage()

      // Set viewport to match page width
      const pageWidth = PAGE_SIZES[request.options.pageSize].width
      await page.setViewport({ width: pageWidth, height: 1080 })

      // Set content and wait for resources
      await this.withTimeout(
        page.setContent(html, { waitUntil: 'networkidle0' }),
        config.PDF_TIMEOUT,
        'PDF generation timed out while loading content'
      )

      // Generate PDF options
      const margin = MARGIN_PRESETS[request.options.margins]
      const pageConfig = PAGE_SIZES[request.options.pageSize]
      const pdfOptions: Parameters<Page['pdf']>[0] = {
        printBackground: true,
        margin: {
          top: margin,
          right: margin,
          bottom: request.options.includePageNumbers ? '25mm' : margin,
          left: margin,
        },
      }

      // Use explicit dimensions for B5 (not in Puppeteer's PaperFormat), format name for others
      if (pageConfig.height) {
        pdfOptions.width = `${pageConfig.width}px`
        pdfOptions.height = `${pageConfig.height}px`
      } else {
        pdfOptions.format = request.options.pageSize as 'A4' | 'Letter' | 'Legal'
      }

      // Add page numbers if enabled
      if (request.options.includePageNumbers) {
        pdfOptions.displayHeaderFooter = true
        pdfOptions.headerTemplate = '<span></span>'
        pdfOptions.footerTemplate = `
          <div style="width: 100%; text-align: center; font-size: 10px; color: #666; font-family: system-ui, sans-serif;">
            Page <span class="pageNumber"></span> of <span class="totalPages"></span>
          </div>
        `
      }

      // Generate PDF
      const pdfBuffer = await this.withTimeout(
        page.pdf(pdfOptions),
        config.PDF_TIMEOUT,
        'PDF generation timed out'
      )

      return Buffer.from(pdfBuffer)
    } finally {
      // Always close the page
      if (page) {
        await page.close().catch(() => {
          // Ignore errors when closing page
        })
      }

      // Release the lock
      this.releaseLock()
    }
  }
}

// Export singleton instance
export const pdfService = new PDFService()
