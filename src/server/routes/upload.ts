import type { FastifyInstance } from 'fastify'
import { config } from '../config.js'
import type { UploadResponse } from '../../shared/types.js'

/**
 * Valid file extensions for markdown files
 */
const VALID_EXTENSIONS = ['.md', '.markdown', '.txt']

/**
 * Extract file extension from filename
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot === -1) return ''
  return filename.slice(lastDot).toLowerCase()
}

/**
 * Register file upload route
 */
export function registerUploadRoute(fastify: FastifyInstance): void {
  fastify.post<{ Reply: UploadResponse | { error: string; message: string } }>(
    '/api/upload',
    async (request, reply) => {
      const requestId = request.id

      try {
        // Get the uploaded file
        const data = await request.file()

        if (!data) {
          fastify.log.warn({ requestId }, 'No file provided in upload request')
          return reply.status(400).send({
            error: 'Bad Request',
            message: 'No file provided. Please upload a markdown file.',
          })
        }

        const { filename, file } = data

        // Validate file extension
        const extension = getFileExtension(filename)
        if (!VALID_EXTENSIONS.includes(extension)) {
          fastify.log.warn({ requestId, filename, extension }, 'Invalid file extension')
          return reply.status(400).send({
            error: 'Bad Request',
            message: `Invalid file type. Supported formats: ${VALID_EXTENSIONS.join(', ')}`,
          })
        }

        // Read file content
        const chunks: Buffer[] = []
        let totalSize = 0

        for await (const chunk of file) {
          totalSize += chunk.length
          if (totalSize > config.MAX_FILE_SIZE) {
            fastify.log.warn({ requestId, filename, size: totalSize }, 'File too large')
            return reply.status(413).send({
              error: 'Payload Too Large',
              message: `File exceeds maximum size of ${Math.round(config.MAX_FILE_SIZE / 1024 / 1024)}MB`,
            })
          }
          chunks.push(chunk)
        }

        const buffer = Buffer.concat(chunks)
        const content = buffer.toString('utf-8')

        fastify.log.info({ requestId, filename, size: buffer.length }, 'File uploaded successfully')

        return reply.send({
          filename,
          content,
          size: buffer.length,
        })
      } catch (error) {
        const err = error as Error
        fastify.log.error({ requestId, error: err.message, stack: err.stack }, 'File upload failed')

        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to process uploaded file. Please try again.',
        })
      }
    }
  )
}
