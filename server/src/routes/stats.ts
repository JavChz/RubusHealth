import { Router } from 'express';
import si from 'systeminformation';
import { checkForUpdate, getLocalVersion } from '../utils/version.js';
import { getPiThresholds } from '../utils/pi-thresholds.js';

export const statsRouter = Router();

statsRouter.get('/', async (_req, res) => {
  try {
    const [load, mem, fs, netStats, temp, processes, osInfo, cpuInfo, time] =
      await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.fsSize(),
        si.networkStats(),
        si.cpuTemperature(),
        si.processes(),
        si.osInfo(),
        si.cpu(),
        si.time(),
      ]);

    const thresholds = await getPiThresholds();
    const { updateAvailable, latestVersion } = await checkForUpdate();

    // CPU
    const cpuUsage = Math.round((load.currentLoad ?? 0) * 10) / 10;
    const cpuTemp = Math.round((temp.main ?? temp.cores?.[0] ?? 0) * 10) / 10;

    // Determine temp status
    let tempStatus: 'normal' | 'warning' | 'throttling' | 'critical' = 'normal';
    if (cpuTemp >= thresholds.critical) tempStatus = 'critical';
    else if (cpuTemp >= thresholds.throttle_hard) tempStatus = 'throttling';
    else if (cpuTemp >= thresholds.throttle_onset) tempStatus = 'warning';

    // RAM
    const ramUsed = mem.active;
    const ramTotal = mem.total;
    const ramPercent = Math.round((ramUsed / ramTotal) * 1000) / 10;

    // Disk
    const primaryFs = fs.find((f) => f.mount === '/') ?? fs[0];
    const diskUsed = primaryFs?.used ?? 0;
    const diskTotal = primaryFs?.size ?? 0;
    const diskPercent = diskTotal > 0 ? Math.round((diskUsed / diskTotal) * 1000) / 10 : 0;

    // Network
    const primaryNet = netStats[0];
    const netRxRate = primaryNet?.rx_sec ?? 0;
    const netTxRate = primaryNet?.tx_sec ?? 0;

    // Top processes sorted by CPU
    const topProcesses = (processes.list ?? [])
      .sort((a, b) => (b.cpu ?? 0) - (a.cpu ?? 0))
      .slice(0, 10)
      .map((p) => ({
        pid: p.pid,
        name: p.name,
        cpu: Math.round((p.cpu ?? 0) * 10) / 10,
        mem: Math.round((p.memVsz / ramTotal) * 1000) / 10,
        state: p.state,
      }));

    res.json({
      cpu: {
        usage: cpuUsage,
        cores: cpuInfo.cores,
        physicalCores: cpuInfo.physicalCores,
        model: cpuInfo.model,
        speed: cpuInfo.speed,
      },
      temperature: {
        current: cpuTemp,
        status: tempStatus,
        thresholds: {
          onset: thresholds.throttle_onset,
          hard: thresholds.throttle_hard,
          critical: thresholds.critical,
        },
        chipset: thresholds.chipset,
      },
      ram: {
        used: ramUsed,
        total: ramTotal,
        free: mem.free,
        percent: ramPercent,
      },
      disk: {
        used: diskUsed,
        total: diskTotal,
        percent: diskPercent,
        mount: primaryFs?.mount ?? '/',
        fs: primaryFs?.fs ?? 'unknown',
      },
      network: {
        interface: primaryNet?.iface ?? 'unknown',
        rxRate: Math.round(netRxRate),
        txRate: Math.round(netTxRate),
        rxTotal: primaryNet?.rx_bytes ?? 0,
        txTotal: primaryNet?.tx_bytes ?? 0,
      },
      system: {
        hostname: osInfo.hostname,
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        arch: osInfo.arch,
        uptime: Math.floor(time.uptime ?? 0),
      },
      processes: topProcesses,
      meta: {
        version: getLocalVersion(),
        updateAvailable,
        latestVersion,
        collectedAt: Date.now(),
      },
    });
  } catch (err) {
    console.error('[stats] Error:', err);
    res.status(500).json({ error: 'Failed to collect system stats' });
  }
});
