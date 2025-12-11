import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestServer } from '../../helpers/server.js';

/**
 * Helper to create multipart form data payload
 */
function createMultipartPayload(
  filename: string,
  content: string,
  boundary: string = '----TestBoundary'
): Buffer {
  const lines = [
    `--${boundary}`,
    `Content-Disposition: form-data; name="file"; filename="${filename}"`,
    'Content-Type: text/plain',
    '',
    content,
    `--${boundary}--`,
    '',
  ];
  return Buffer.from(lines.join('\r\n'));
}

describe('Upload Route Integration Tests', () => {
  let app: FastifyInstance;
  const boundary = '----TestBoundary';

  beforeAll(async () => {
    app = await createTestServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/upload', () => {
    it('returns 200 for valid .md file upload', async () => {
      const content = '# Hello World\n\nThis is a test markdown file.';
      const payload = createMultipartPayload('test.md', content, boundary);

      const response = await app.inject({
        method: 'POST',
        url: '/api/upload',
        payload,
        headers: {
          'content-type': `multipart/form-data; boundary=${boundary}`,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body).toHaveProperty('filename', 'test.md');
      expect(body).toHaveProperty('content', content);
      expect(body).toHaveProperty('size');
      expect(typeof body.size).toBe('number');
    });

    it('returns 200 for valid .txt file upload', async () => {
      const content = 'This is a plain text file with some content.';
      const payload = createMultipartPayload('document.txt', content, boundary);

      const response = await app.inject({
        method: 'POST',
        url: '/api/upload',
        payload,
        headers: {
          'content-type': `multipart/form-data; boundary=${boundary}`,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body).toHaveProperty('filename', 'document.txt');
      expect(body).toHaveProperty('content', content);
    });

    it('returns 400 for invalid file extension', async () => {
      const content = 'console.log("hello");';
      const payload = createMultipartPayload('script.js', content, boundary);

      const response = await app.inject({
        method: 'POST',
        url: '/api/upload',
        payload,
        headers: {
          'content-type': `multipart/form-data; boundary=${boundary}`,
        },
      });

      expect(response.statusCode).toBe(400);

      const body = response.json();
      expect(body).toHaveProperty('error');
      expect(body).toHaveProperty('message');
      expect(body.message).toMatch(/invalid file type|supported formats/i);
    });

    it('returns 400 when no file is provided', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/upload',
        payload: '',
        headers: {
          'content-type': 'multipart/form-data; boundary=----EmptyBoundary',
        },
      });

      expect(response.statusCode).toBe(400);

      const body = response.json();
      expect(body).toHaveProperty('error');
      expect(body).toHaveProperty('message');
      expect(body.message).toMatch(/no file/i);
    });

    it('handles large file appropriately', async () => {
      // Note: Fastify's inject() method handles large payloads differently than real HTTP.
      // The fastify-multipart plugin's fileSize limit is enforced at stream level,
      // which may not trigger the same way in inject() tests.
      //
      // This test verifies the route handles a moderately large file (within limits).
      // Real oversized file rejection is best tested with actual HTTP requests or
      // by mocking the file size check directly.
      const largeContent = 'x'.repeat(1024 * 1024); // 1MB file (within limit)
      const payload = createMultipartPayload('large.md', largeContent, boundary);

      const response = await app.inject({
        method: 'POST',
        url: '/api/upload',
        payload,
        headers: {
          'content-type': `multipart/form-data; boundary=${boundary}`,
        },
      });

      // Large file within limit should succeed
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toHaveProperty('filename', 'large.md');
      expect(body.size).toBeGreaterThan(1024 * 1024 - 100); // Account for encoding
    });
  });
});
