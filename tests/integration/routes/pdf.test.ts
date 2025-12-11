import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';

// Mock Puppeteer before importing server - must use inline factory
vi.mock('puppeteer', () => {
  const mockPage = {
    setViewport: vi.fn().mockResolvedValue(undefined),
    setContent: vi.fn().mockResolvedValue(undefined),
    pdf: vi.fn().mockResolvedValue(Buffer.from('%PDF-1.4 mock')),
    close: vi.fn().mockResolvedValue(undefined),
  };

  const mockBrowser = {
    newPage: vi.fn().mockResolvedValue(mockPage),
    close: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
  };

  return {
    default: {
      launch: vi.fn().mockResolvedValue(mockBrowser),
    },
  };
});

// Import server after mocking
import { createTestServer } from '../../helpers/server.js';

describe('PDF Route Integration Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/pdf', () => {
    it('returns 200 and PDF content for valid request', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/pdf',
        payload: {
          markdown: '# Test Document\n\nThis is test content.',
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

      // Check that response body starts with PDF signature from mock
      const body = response.rawPayload;
      expect(body.toString()).toContain('%PDF');
    });

    it('returns 200 with default options when options not provided', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/pdf',
        payload: {
          markdown: '# Minimal Test',
          theme: 'modern',
        },
        headers: {
          'content-type': 'application/json',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
    });

    it('returns 400 when markdown is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/pdf',
        payload: {
          theme: 'clean',
        },
        headers: {
          'content-type': 'application/json',
        },
      });

      expect(response.statusCode).toBe(400);

      const body = response.json();
      expect(body).toHaveProperty('error');
    });

    it('returns 400 when markdown is empty', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/pdf',
        payload: {
          markdown: '',
          theme: 'clean',
        },
        headers: {
          'content-type': 'application/json',
        },
      });

      expect(response.statusCode).toBe(400);

      const body = response.json();
      expect(body).toHaveProperty('error');
    });

    it('returns 400 for invalid theme', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/pdf',
        payload: {
          markdown: '# Test',
          theme: 'nonexistent-theme',
        },
        headers: {
          'content-type': 'application/json',
        },
      });

      expect(response.statusCode).toBe(400);

      const body = response.json();
      expect(body).toHaveProperty('error');
    });

    it('returns 400 for invalid options', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/pdf',
        payload: {
          markdown: '# Test',
          theme: 'clean',
          options: {
            pageSize: 'InvalidSize',
            margins: 'invalid-margin',
          },
        },
        headers: {
          'content-type': 'application/json',
        },
      });

      expect(response.statusCode).toBe(400);

      const body = response.json();
      expect(body).toHaveProperty('error');
    });

    it('returns 400 for invalid margin preset', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/pdf',
        payload: {
          markdown: '# Test',
          theme: 'clean',
          options: {
            pageSize: 'A4',
            margins: 'extra-wide', // Invalid preset
          },
        },
        headers: {
          'content-type': 'application/json',
        },
      });

      expect(response.statusCode).toBe(400);

      const body = response.json();
      expect(body).toHaveProperty('error');
    });
  });
});
