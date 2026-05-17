import { Router } from 'express';
import { getLocalVersion } from '../utils/version.js';
import si from 'systeminformation';

export const healthRouter = Router();

const startTime = Date.now();

healthRouter.get('/', async (_req, res) => {
  try {
    const time = await si.time();
    res.json({
      status: 'ok',
      version: getLocalVersion(),
      uptime: Math.floor(time.uptime ?? 0),
      processUptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.json({
      status: 'ok',
      version: getLocalVersion(),
      uptime: 0,
      processUptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
    });
  }
});
