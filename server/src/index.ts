import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadSettings } from './config.js';
import { getDb } from './db.js';
import { startCollector } from './collector.js';
import { findAvailablePort } from './utils/port.js';
import { statsRouter } from './routes/stats.js';
import { historyRouter } from './routes/history.js';
import { settingsRouter } from './routes/settings.js';
import { healthRouter } from './routes/health.js';
import { versionRouter } from './routes/version.js';
import { docsRouter } from './routes/docs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const settings = loadSettings();

  // Resolve port (auto-increment if busy)
  const port = await findAvailablePort(settings.port);
  if (port !== settings.port) {
    console.log(`[server] Port ${settings.port} busy, using ${port}`);
  }

  // Init DB (creates tables if needed)
  getDb();

  // Start metrics collector
  startCollector();

  const app = express();

  app.use(cors());
  app.use(express.json());

  // API routes
  app.use('/api/health', healthRouter);
  app.use('/api/version', versionRouter);
  app.use('/api/stats', statsRouter);
  app.use('/api/history', historyRouter);
  app.use('/api/settings', settingsRouter);
  app.use('/api/docs', docsRouter);

  // Serve frontend in production
  const webDist = join(__dirname, '../../web/dist');
  app.use(express.static(webDist));

  // SPA fallback — serve index.html for all non-API routes
  app.get('*', (_req, res) => {
    res.sendFile(join(webDist, 'index.html'));
  });

  app.listen(port, '0.0.0.0', () => {
    console.log(`\n🫐 RubusHealth running at:`);
    console.log(`   http://localhost:${port}`);
    console.log(`   API docs: http://localhost:${port}/api/docs\n`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('[server] Shutting down gracefully...');
    getDb().close();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('[server] Fatal startup error:', err);
  process.exit(1);
});
