import type { FastifyInstance } from 'fastify'
import { themeService } from '../services/themes.js'
import type { Theme } from '../../shared/types.js'

interface ThemesResponse {
  themes: Theme[]
}

/**
 * Register the themes API route
 * GET /api/themes - Returns list of available themes with metadata
 */
export function registerThemesRoute(server: FastifyInstance): void {
  server.get<{ Reply: ThemesResponse }>('/api/themes', async (_request, reply) => {
    const themes = themeService.getThemes()
    return reply.send({ themes })
  })
}
