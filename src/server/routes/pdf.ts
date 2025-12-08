import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { pdfService } from '../services/pdf.js'
import { config } from '../config.js'

/**
 * Request validation schema for PDF generation
 */
const pdfRequestSchema = z.object({
  markdown: z
    .string()
    .min(1, 'Markdown content is required')
    .max(config.MAX_FILE_SIZE, `Content exceeds maximum size of ${config.MAX_FILE_SIZE} bytes`),
  theme: z.enum(['clean', 'academic', 'modern', 'compact']),
  options: z.object({
    pageSize: z.enum(['A4', 'Letter', 'Legal']).default('A4'),
    margins: z.enum(['normal', 'narrow', 'wide']).default('normal'),
    includePageNumbers: z.boolean().default(true),
  }).optional().default({
    pageSize: 'A4',
    margins: 'normal',
    includePageNumbers: true,
  }),
})

type PDFRequestBody = z.infer<typeof pdfRequestSchema>

/**
 * Custom error class for timeout errors
 */
class TimeoutError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TimeoutError'
  }
}

/**
 * Register PDF generation route
 */
export function registerPdfRoute(fastify: FastifyInstance): void {
  fastify.post<{ Body: PDFRequestBody }>('/api/pdf', async (request, reply) => {
    const requestId = request.id

    try {
      // Validate request body
      const parseResult = pdfRequestSchema.safeParse(request.body)

      if (!parseResult.success) {
        const errors = parseResult.error.flatten()
        fastify.log.warn({ requestId, errors }, 'PDF request validation failed')

        return reply.status(400).send({
          error: 'Validation failed',
          details: errors.fieldErrors,
        })
      }

      const validatedBody = parseResult.data

      fastify.log.info(
        { requestId, theme: validatedBody.theme, pageSize: validatedBody.options.pageSize },
        'Starting PDF generation'
      )

      // Generate PDF
      const pdfBuffer = await pdfService.generatePDF(validatedBody)

      fastify.log.info({ requestId, size: pdfBuffer.length }, 'PDF generation complete')

      // Set response headers
      return reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', 'attachment; filename="document.pdf"')
        .header('Content-Length', pdfBuffer.length)
        .send(pdfBuffer)
    } catch (error) {
      const err = error as Error

      // Handle timeout errors
      if (err.message.includes('timed out')) {
        fastify.log.error({ requestId, error: err.message }, 'PDF generation timed out')
        return reply.status(408).send({
          error: 'Request Timeout',
          message: 'PDF generation took too long. Try with a smaller document.',
        })
      }

      // Handle queue overflow
      if (err.message.includes('Too many pending')) {
        fastify.log.warn({ requestId, error: err.message }, 'PDF request queue full')
        return reply.status(503).send({
          error: 'Service Unavailable',
          message: 'Server is busy. Please try again later.',
        })
      }

      // Handle other errors
      fastify.log.error({ requestId, error: err.message, stack: err.stack }, 'PDF generation failed')
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to generate PDF. Please try again.',
      })
    }
  })
}
