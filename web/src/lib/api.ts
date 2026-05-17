export interface SystemStats {
  cpu: {
    usage: number;
    cores: number;
    physicalCores: number;
    model: string;
    speed: number;
  };
  temperature: {
    current: number;
    status: 'normal' | 'warning' | 'throttling' | 'critical';
    thresholds: { onset: number; hard: number; critical: number };
    chipset: string;
  };
  ram: {
    used: number;
    total: number;
    free: number;
    percent: number;
  };
  disk: {
    used: number;
    total: number;
    percent: number;
    mount: string;
    fs: string;
  };
  network: {
    interface: string;
    rxRate: number;
    txRate: number;
    rxTotal: number;
    txTotal: number;
  };
  system: {
    hostname: string;
    platform: string;
    distro: string;
    release: string;
    arch: string;
    uptime: number;
  };
  processes: Array<{
    pid: number;
    name: string;
    cpu: number;
    mem: number;
    state: string;
  }>;
  meta: {
    version: string;
    updateAvailable: boolean;
    latestVersion: string;
    collectedAt: number;
  };
}

export interface HistoryPoint {
  timestamp: number;
  cpu: number;
  temp: number;
  ram: number;
  disk: number;
  netRx: number;
  netTx: number;
}

export interface HistoryResponse {
  range: string;
  count: number;
  data: HistoryPoint[];
}

export interface AppSettings {
  port: number;
  autostart: boolean;
  collectIntervalSeconds: number;
  retentionHours: number;
}

const BASE = '/api';

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getStats: () => request<SystemStats>('/stats'),
  getHistory: (range: '30m' | '1h' | '6h' | '24h' = '1h') =>
    request<HistoryResponse>(`/history?range=${range}`),
  getSettings: () => request<AppSettings>('/settings'),
  updateSettings: (settings: Partial<AppSettings>) =>
    request<{ success: boolean; settings: AppSettings }>('/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    }),
  restartService: () =>
    request<{ success: boolean }>('/settings/restart', { method: 'POST' }),
  toggleAutostart: (enable: boolean) =>
    request<{ success: boolean }>('/settings/autostart', {
      method: 'POST',
      body: JSON.stringify({ enable }),
    }),
  exportSettings: () => {
    window.open(`${BASE}/settings/export`, '_blank');
  },
  getHealth: () => request<{ status: string; version: string; uptime: number }>('/health'),
};
