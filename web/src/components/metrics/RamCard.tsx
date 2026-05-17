import { MemoryStick } from 'lucide-react';
import { ProgressRing, getGaugeColor } from '../ui/ProgressRing';
import { Skeleton } from '../ui/Skeleton';
import type { SystemStats } from '../../lib/api';

function formatBytes(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(0)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

interface RamCardProps {
  stats: SystemStats | null;
  loading: boolean;
}

export function RamCard({ stats, loading }: RamCardProps) {
  if (loading && !stats) {
    return (
      <div className="card p-5 space-y-4">
        <Skeleton className="h-4 w-16" />
        <div className="flex items-center gap-4">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  const percent = stats?.ram.percent ?? 0;
  const color = getGaugeColor(percent);

  return (
    <div className="card p-5 fade-in">
      <div className="flex items-center gap-1.5 mb-4">
        <MemoryStick size={14} style={{ color: 'var(--color-text-muted)' }} />
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
          Memory
        </span>
      </div>

      <div className="flex items-center gap-4">
        <ProgressRing
          value={percent}
          size={88}
          strokeWidth={7}
          label={`${Math.round(percent)}%`}
          sublabel="used"
        />

        <div className="flex-1">
          <div className="text-2xl font-bold metric-value mb-1" style={{ color }}>
            {formatBytes(stats?.ram.used ?? 0)}
          </div>
          <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
            of {formatBytes(stats?.ram.total ?? 0)} total
          </p>
          <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Free </span>
            <span className="metric-value">{formatBytes(stats?.ram.free ?? 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
