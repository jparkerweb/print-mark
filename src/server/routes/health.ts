import type { FastifyInstance } from 'fastify'
import { createRequire } from 'module'
import type { HealthResponse } from '../../shared/types.js'

const require = createRequire(import.meta.url)
const packageJson = require('../../../package.json')

export function registerHealthRoute(server: FastifyInstance) {
  server.get<{ Reply: HealthResponse }>('/api/health', async () => {
    return {
      status: 'healthy',
      version: packageJson.version,
    }
  })
}
