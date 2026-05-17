import si from 'systeminformation';
import { insertMetric, purgeOldMetrics } from './db.js';
import { loadSettings } from './config.js';

interface CollectorState {
  lastNetRx: number;
  lastNetTx: number;
  lastNetTimestamp: number;
  interval: ReturnType<typeof setInterval> | null;
  purgeInterval: ReturnType<typeof setInterval> | null;
}

const state: CollectorState = {
  lastNetRx: 0,
  lastNetTx: 0,
  lastNetTimestamp: Date.now(),
  interval: null,
  purgeInterval: null,
};

async function collect(): Promise<void> {
  try {
    const [load, mem, fs, netStats, temp] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.networkStats(),
      si.cpuTemperature(),
    ]);

    // CPU usage (average across all cores)
    const cpuUsage = load.currentLoad ?? 0;

    // Temperature (Pi specific: main sensor)
    const cpuTemp = temp.main ?? temp.cores?.[0] ?? 0;

    // RAM
    const ramUsed = mem.active;
    const ramTotal = mem.total;

    // Disk — aggregate across all non-tmpfs mounts, primary only
    const primaryFs = fs.find((f) => f.mount === '/') ?? fs[0];
    const diskUsed = primaryFs?.used ?? 0;
    const diskTotal = primaryFs?.size ?? 0;

    // Network — cumulative bytes delta
    const primaryNet = netStats[0];
    const now = Date.now();
    const netRx = primaryNet?.rx_bytes ?? 0;
    const netTx = primaryNet?.tx_bytes ?? 0;

    state.lastNetRx = netRx;
    state.lastNetTx = netTx;
    state.lastNetTimestamp = now;

    insertMetric({
      timestamp: now,
      cpu_usage: Math.round(cpuUsage * 10) / 10,
      cpu_temp: Math.round(cpuTemp * 10) / 10,
      ram_used: ramUsed,
      ram_total: ramTotal,
      disk_used: diskUsed,
      disk_total: diskTotal,
      net_rx: netRx,
      net_tx: netTx,
    });
  } catch (err) {
    console.error('[collector] Error collecting metrics:', err);
  }
}

export function startCollector(): void {
  const settings = loadSettings();
  const intervalMs = settings.collectIntervalSeconds * 1000;

  // Collect immediately on start
  collect();

  state.interval = setInterval(collect, intervalMs);

  // Purge old data every 10 minutes
  state.purgeInterval = setInterval(
    () => {
      const s = loadSettings();
      const deleted = purgeOldMetrics(s.retentionHours);
      if (deleted > 0) {
        console.log(`[collector] Purged ${deleted} old metric rows`);
      }
    },
    10 * 60 * 1000
  );

  console.log(`[collector] Started — collecting every ${settings.collectIntervalSeconds}s`);
}

export function stopCollector(): void {
  if (state.interval) clearInterval(state.interval);
  if (state.purgeInterval) clearInterval(state.purgeInterval);
  state.interval = null;
  state.purgeInterval = null;
}
