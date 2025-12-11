import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestServer } from '../../helpers/server.js';

describe('Health Route Integration Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/health', () => {
    it('returns 200 status code', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/health',
      });

      expect(response.statusCode).toBe(200);
    });

    it('returns correct response structure', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/health',
      });

      const body = response.json();

      expect(body).toHaveProperty('status', 'healthy');
      expect(body).toHaveProperty('version');
      expect(typeof body.version).toBe('string');
    });
  });
});
