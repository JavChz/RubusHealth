import { ArrowDown, ArrowUp, Wifi } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import { useStatsStore } from '../../store/useStatsStore';

function formatRate(bytesPerSec: number): string {
  if (bytesPerSec >= 1024 * 1024) return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
  if (bytesPerSec >= 1024) return `${(bytesPerSec / 1024).toFixed(0)} KB/s`;
  return `${bytesPerSec} B/s`;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export function NetworkCard() {
  const { stats, isLoading } = useStatsStore();

  if (isLoading && !stats) {
    return (
      <div className="card p-5 space-y-4">
        <Skeleton className="h-4 w-20" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      </div>
    );
  }

  const net = stats?.network;

  return (
    <div className="card p-5 fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <Wifi size={14} style={{ color: 'var(--color-text-muted)' }} />
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            Network
          </span>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded" style={{
          color: 'var(--color-text-secondary)',
          background: 'var(--color-surface-2)',
        }}>
          {net?.interface ?? '—'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Download */}
        <div className="rounded-xl p-3" style={{ background: 'var(--color-surface-2)' }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <ArrowDown size={12} style={{ color: 'var(--color-ok)' }} />
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Download</span>
          </div>
          <div className="text-lg font-bold metric-value" style={{ color: 'var(--color-ok)' }}>
            {formatRate(net?.rxRate ?? 0)}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {formatBytes(net?.rxTotal ?? 0)} total
          </div>
        </div>

        {/* Upload */}
        <div className="rounded-xl p-3" style={{ background: 'var(--color-surface-2)' }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <ArrowUp size={12} style={{ color: 'var(--color-accent)' }} />
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Upload</span>
          </div>
          <div className="text-lg font-bold metric-value" style={{ color: 'var(--color-accent)' }}>
            {formatRate(net?.txRate ?? 0)}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {formatBytes(net?.txTotal ?? 0)} total
          </div>
        </div>
      </div>
    </div>
  );
}
