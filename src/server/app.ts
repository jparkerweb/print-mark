import Fastify, { FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyMultipart from '@fastify/multipart';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from './config.js';
import { registerHealthRoute } from './routes/health.js';
import { registerThemesRoute } from './routes/themes.js';
import { registerPdfRoute } from './routes/pdf.js';
import { registerUploadRoute } from './routes/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface CreateAppOptions {
  logger?: boolean;
}

export async function createApp(
  options: CreateAppOptions = {}
): Promise<FastifyInstance> {
  const { logger = config.NODE_ENV !== 'test' } = options;

  const server = Fastify({
    logger,
  });

  // Register CORS plugin
  await server.register(fastifyCors, {
    origin: config.NODE_ENV === 'development' ? true : false,
  });

  // Register security headers with Helmet
  await server.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  });

  // Register multipart plugin for file uploads
  await server.register(fastifyMultipart, {
    limits: {
      fileSize: config.MAX_FILE_SIZE,
    },
  });

  // Register API routes
  registerHealthRoute(server);
  registerThemesRoute(server);
  registerPdfRoute(server);
  registerUploadRoute(server);

  // Register static file serving for the client build
  await server.register(fastifyStatic, {
    root: join(__dirname, '../client'),
    prefix: '/',
  });

  return server;
}
