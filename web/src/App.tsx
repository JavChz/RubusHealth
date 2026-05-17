import { useEffect, useState } from 'react';
import { usePolling } from './hooks/usePolling';
import { useStatsStore } from './store/useStatsStore';
import { useSettingsStore } from './store/useSettingsStore';
import { useConnectionStore } from './store/useConnectionStore';
import { api } from './lib/api';

import { Header } from './components/layout/Header';
import { UpdateBanner } from './components/layout/UpdateBanner';
import { StatusCard } from './components/status/StatusCard';
import { TemperatureCard } from './components/metrics/TemperatureCard';
import { MetricsGrid } from './components/metrics/MetricsGrid';
import { NetworkCard } from './components/network/NetworkCard';
import { ProcessTable } from './components/processes/ProcessTable';
import { HistoryCharts } from './components/history/HistoryCharts';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { WifiOff, RefreshCw } from 'lucide-react';

function OfflineOverlay() {
  const { status, lastSeen, consecutiveErrors } = useConnectionStore();

  if (status !== 'offline' || consecutiveErrors < 3) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 p-4 m-4 rounded-2xl flex items-center justify-between"
      style={{
        background: 'var(--color-danger-dim)',
        border: '1px solid rgba(244,63,94,0.3)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center gap-3">
        <WifiOff size={18} style={{ color: 'var(--color-danger)' }} />
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-danger)' }}>
            Connection lost
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {lastSeen ? `Last seen ${new Date(lastSeen).toLocaleTimeString()}` : 'Never connected'}
            {' · '}{consecutiveErrors} failed attempts
          </p>
        </div>
      </div>
      <RefreshCw size={14} className="animate-spin" style={{ color: 'var(--color-danger)', opacity: 0.7 }} />
    </div>
  );
}

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { stats, isLoading } = useStatsStore();
  const { setSettings } = useSettingsStore();

  // Start polling stats every 2s
  usePolling();

  // Load settings once on mount
  useEffect(() => {
    api.getSettings().then(setSettings).catch(() => {});
  }, [setSettings]);

  const showUpdateBanner = stats?.meta.updateAvailable ?? false;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-base)' }}>
      {/* Update banner */}
      {showUpdateBanner && <UpdateBanner latestVersion={stats?.meta.latestVersion ?? ''} />}

      {/* Sticky header */}
      <Header onSettingsOpen={() => setSettingsOpen(true)} />

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4 pb-24">
        {/* Row 1: Status + Temperature (side by side on tablet+) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatusCard />
          <TemperatureCard stats={stats} loading={isLoading} />
        </div>

        {/* Row 2: Metrics grid (CPU / RAM / Disk) */}
        <MetricsGrid />

        {/* Row 3: Network */}
        <NetworkCard />

        {/* Row 4: History charts */}
        <HistoryCharts />

        {/* Row 5: Process table */}
        <ProcessTable />

        {/* Footer */}
        <div className="pt-4 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
          RubusHealth v{stats?.meta.version ?? '—'} ·{' '}
          <a
            href="/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-accent)', textDecoration: 'none' }}
          >
            API Docs
          </a>
          {' · '}
          <a
            href="https://github.com/JavChz/RubusHealth"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
          >
            GitHub
          </a>
        </div>
      </main>

      {/* Settings panel */}
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Offline toast */}
      <OfflineOverlay />
    </div>
  );
}
