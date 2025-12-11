import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestServer } from '../../helpers/server.js';

describe('Themes Route Integration Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/themes', () => {
    it('returns 200 status code', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/themes',
      });

      expect(response.statusCode).toBe(200);
    });

    it('returns themes array in response', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/themes',
      });

      const body = response.json();

      expect(body).toHaveProperty('themes');
      expect(Array.isArray(body.themes)).toBe(true);
      expect(body.themes.length).toBeGreaterThan(0);
    });

    it('each theme has required properties', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/themes',
      });

      const body = response.json();

      for (const theme of body.themes) {
        expect(theme).toHaveProperty('id');
        expect(typeof theme.id).toBe('string');

        expect(theme).toHaveProperty('name');
        expect(typeof theme.name).toBe('string');

        expect(theme).toHaveProperty('description');
        expect(typeof theme.description).toBe('string');
      }
    });
  });
});
