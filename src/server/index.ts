import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import fastifyMultipart from '@fastify/multipart'
import fastifyCors from '@fastify/cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { config } from './config.js'
import { registerHealthRoute } from './routes/health.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const server = Fastify({
  logger: true,
})

async function start() {
  // Register CORS plugin
  await server.register(fastifyCors, {
    origin: config.NODE_ENV === 'development' ? true : false,
  })

  // Register multipart plugin for file uploads
  await server.register(fastifyMultipart, {
    limits: {
      fileSize: config.MAX_FILE_SIZE,
    },
  })

  // Register health route
  registerHealthRoute(server)

  // Register static file serving for the client build
  await server.register(fastifyStatic, {
    root: join(__dirname, '../client'),
    prefix: '/',
  })

  // Start server
  try {
    await server.listen({ port: config.PORT, host: config.HOST })
    console.log(`Server running at http://${config.HOST}:${config.PORT}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

// Graceful shutdown
const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT']
signals.forEach((signal) => {
  process.on(signal, async () => {
    console.log(`Received ${signal}, shutting down gracefully...`)
    await server.close()
    process.exit(0)
  })
})

start()
