import { createApp } from './app.js';
import { config } from './config.js';
import { pdfService } from './services/pdf.js';

async function start() {
  const server = await createApp({ logger: true });

  // Start server
  try {
    await server.listen({ port: config.PORT, host: config.HOST });
    console.log(`Server running at http://${config.HOST}:${config.PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }

  // Graceful shutdown
  const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      console.log(`Received ${signal}, shutting down gracefully...`);
      await pdfService.closeBrowser();
      await server.close();
      process.exit(0);
    });
  });
}

start();
