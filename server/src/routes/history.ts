import { Router } from 'express';
import { getHistory } from '../db.js';

export const historyRouter = Router();

const RANGE_MAP: Record<string, number> = {
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
};

historyRouter.get('/', (req, res) => {
  const range = (req.query['range'] as string) ?? '1h';
  const rangeMs = RANGE_MAP[range] ?? RANGE_MAP['1h'];
  const fromTimestamp = Date.now() - rangeMs;

  // Limit points based on range to avoid over-fetching
  const limitMap: Record<string, number> = {
    '30m': 120,
    '1h': 240,
    '6h': 360,
    '24h': 500,
  };
  const limit = limitMap[range] ?? 240;

  try {
    const rows = getHistory(fromTimestamp, limit);

    // Normalize bytes to MB for readability
    const data = rows.map((r) => ({
      timestamp: r.timestamp,
      cpu: r.cpu_usage,
      temp: r.cpu_temp,
      ram: Math.round((r.ram_used / r.ram_total) * 1000) / 10,
      disk: r.disk_total > 0 ? Math.round((r.disk_used / r.disk_total) * 1000) / 10 : 0,
      netRx: r.net_rx,
      netTx: r.net_tx,
    }));

    res.json({ range, count: data.length, data });
  } catch (err) {
    console.error('[history] Error:', err);
    res.status(500).json({ error: 'Failed to retrieve history' });
  }
});
