import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestServer } from '../helpers/server.js';

/**
 * Slow tests that use real Puppeteer for PDF generation.
 * These tests are skipped by default and run separately via `npm run test:slow`.
 *
 * To run: npm run test:slow
 *
 * Requirements:
 * - Chrome/Chromium must be installed and accessible
 * - Tests take 2-5 seconds each due to browser launch
 */
describe('PDF Real Generation Tests (Slow)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    // Longer timeout for real Puppeteer initialization
    app = await createTestServer();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  it('generates a valid PDF with real Puppeteer', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/pdf',
      payload: {
        markdown: `# Real PDF Test

This is a test document generated with real Puppeteer.

## Features

- Real browser rendering
- Actual PDF output
- Full CSS styling

## Code Block

\`\`\`javascript
console.log('Hello, PDF!');
\`\`\`

> This is a blockquote for testing.

| Column 1 | Column 2 |
|----------|----------|
| Data A   | Data B   |
`,
        theme: 'clean',
        options: {
          pageSize: 'A4',
          margins: 'normal',
          includePageNumbers: true,
        },
      },
      headers: {
        'content-type': 'application/json',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toBe('application/pdf');

    // Verify it's a real PDF by checking the signature
    const pdfBuffer = response.rawPayload;
    const pdfSignature = pdfBuffer.slice(0, 5).toString();
    expect(pdfSignature).toBe('%PDF-');

    // Real PDFs should be larger than 1KB
    expect(pdfBuffer.length).toBeGreaterThan(1024);
  }, 30000); // 30 second timeout for PDF generation

  it('generates PDF with different themes', async () => {
    const themes = ['clean', 'academic', 'modern', 'compact'] as const;

    for (const theme of themes) {
      const response = await app.inject({
        method: 'POST',
        url: '/api/pdf',
        payload: {
          markdown: `# ${theme} Theme Test\n\nTesting the ${theme} theme.`,
          theme,
        },
        headers: {
          'content-type': 'application/json',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');

      const pdfBuffer = response.rawPayload;
      expect(pdfBuffer.slice(0, 5).toString()).toBe('%PDF-');
    }
  }, 60000); // 60 second timeout for multiple PDFs

  it('generates PDF with different page sizes', async () => {
    const pageSizes = ['A4', 'Letter', 'Legal'] as const;

    for (const pageSize of pageSizes) {
      const response = await app.inject({
        method: 'POST',
        url: '/api/pdf',
        payload: {
          markdown: `# ${pageSize} Page Size\n\nTesting ${pageSize} format.`,
          theme: 'clean',
          options: {
            pageSize,
            margins: 'normal',
          },
        },
        headers: {
          'content-type': 'application/json',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
    }
  }, 60000);
});
