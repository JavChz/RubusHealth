import { Server, Clock } from 'lucide-react';
import { useStatsStore } from '../../store/useStatsStore';
import { useConnectionStore } from '../../store/useConnectionStore';
import { Skeleton } from '../ui/Skeleton';

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function StatusCard() {
  const { stats, isLoading } = useStatsStore();
  const { status, lastSeen } = useConnectionStore();

  const isOnline = status === 'online';
  const isOffline = status === 'offline';

  if (isLoading && !stats) {
    return (
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-8 w-28" />
          </div>
          <Skeleton className="w-16 h-16 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`card p-5 fade-in transition-all duration-500 ${
        isOffline ? 'glow-danger' : isOnline ? 'glow-ok' : ''
      }`}
      style={{
        borderColor: isOffline
          ? 'rgba(244,63,94,0.3)'
          : isOnline
          ? 'rgba(34,211,165,0.2)'
          : 'var(--color-border)',
      }}
    >
      <div className="flex items-center justify-between">
        {/* Left: status info */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-1"
            style={{ color: 'var(--color-text-muted)' }}>
            System Status
          </p>
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full pulse-dot"
              style={{
                background: isOffline
                  ? 'var(--color-danger)'
                  : isOnline
                  ? 'var(--color-ok)'
                  : 'var(--color-warn)',
              }}
            />
            <span
              className="text-2xl font-bold"
              style={{
                color: isOffline
                  ? 'var(--color-danger)'
                  : isOnline
                  ? 'var(--color-ok)'
                  : 'var(--color-warn)',
              }}
            >
              {isOffline ? 'Offline' : isOnline ? 'Alive' : 'Connecting'}
            </span>
          </div>

          {stats && (
            <div className="mt-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <Clock size={12} style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-sm metric-value" style={{ color: 'var(--color-text-secondary)' }}>
                  Up {formatUptime(stats.system.uptime)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Server size={12} style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {stats.system.distro} · {stats.system.arch}
                </span>
              </div>
            </div>
          )}

          {isOffline && lastSeen && (
            <p className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Last seen {new Date(lastSeen).toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Right: big status indicator */}
        <div
          className="flex items-center justify-center w-16 h-16 rounded-2xl"
          style={{
            background: isOffline
              ? 'var(--color-danger-dim)'
              : 'var(--color-ok-dim)',
            border: `1px solid ${isOffline ? 'rgba(244,63,94,0.2)' : 'rgba(34,211,165,0.2)'}`,
          }}
        >
          <Server
            size={28}
            style={{
              color: isOffline ? 'var(--color-danger)' : 'var(--color-ok)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
