import { FastifyInstance } from 'fastify';
import { createApp } from '../../src/server/app.js';

export async function createTestServer(): Promise<FastifyInstance> {
  const app = await createApp({ logger: false });
  await app.ready();
  return app;
}
