import { Cpu } from 'lucide-react';
import { ProgressRing, getGaugeColor } from '../ui/ProgressRing';
import { Skeleton } from '../ui/Skeleton';
import type { SystemStats } from '../../lib/api';

interface CpuCardProps {
  stats: SystemStats | null;
  loading: boolean;
}

export function CpuCard({ stats, loading }: CpuCardProps) {
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

  const usage = stats?.cpu.usage ?? 0;
  const color = getGaugeColor(usage);

  return (
    <div className="card p-5 fade-in">
      <div className="flex items-center gap-1.5 mb-4">
        <Cpu size={14} style={{ color: 'var(--color-text-muted)' }} />
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
          CPU
        </span>
      </div>

      <div className="flex items-center gap-4">
        <ProgressRing
          value={usage}
          size={88}
          strokeWidth={7}
          label={`${Math.round(usage)}%`}
          sublabel="load"
        />

        <div className="flex-1 min-w-0">
          <div className="text-2xl font-bold metric-value mb-1" style={{ color }}>
            {usage.toFixed(1)}%
          </div>
          <p className="text-xs truncate mb-2" style={{ color: 'var(--color-text-muted)' }}>
            {stats?.cpu.model ?? '—'}
          </p>
          <div className="flex gap-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            <span>
              <span style={{ color: 'var(--color-text-muted)' }}>Cores </span>
              <span className="metric-value">{stats?.cpu.cores ?? '—'}</span>
            </span>
            <span>
              <span style={{ color: 'var(--color-text-muted)' }}>Speed </span>
              <span className="metric-value">{stats?.cpu.speed ?? '—'} GHz</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
