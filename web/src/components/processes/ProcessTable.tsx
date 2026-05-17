import { useState } from 'react';
import { List, ChevronDown, ChevronUp } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import { useStatsStore } from '../../store/useStatsStore';

type SortKey = 'cpu' | 'mem';

export function ProcessTable() {
  const { stats, isLoading } = useStatsStore();
  const [sortKey, setSortKey] = useState<SortKey>('cpu');

  if (isLoading && !stats) {
    return (
      <div className="card p-5 space-y-3">
        <Skeleton className="h-4 w-28" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  const processes = [...(stats?.processes ?? [])].sort((a, b) => b[sortKey] - a[sortKey]);

  const SortButton = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      id={`sort-process-${k}`}
      onClick={() => setSortKey(k)}
      className="flex items-center gap-0.5 text-xs transition-colors"
      style={{ color: sortKey === k ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
    >
      {label}
      {sortKey === k ? <ChevronDown size={10} /> : <ChevronUp size={10} style={{ opacity: 0.3 }} />}
    </button>
  );

  return (
    <div className="card p-5 fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <List size={14} style={{ color: 'var(--color-text-muted)' }} />
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            Top Processes
          </span>
        </div>
        <div className="flex items-center gap-3">
          <SortButton k="cpu" label="CPU" />
          <SortButton k="mem" label="MEM" />
        </div>
      </div>

      <div className="space-y-1">
        {/* Header */}
        <div className="grid gap-2 px-2 pb-1 text-xs"
          style={{ gridTemplateColumns: '1fr 3rem 3rem 3rem', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>
          <span>Process</span>
          <span className="text-right">CPU%</span>
          <span className="text-right">MEM%</span>
          <span className="text-right">PID</span>
        </div>

        {processes.slice(0, 8).map((proc) => (
          <div
            key={proc.pid}
            className="grid gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors"
            style={{
              gridTemplateColumns: '1fr 3rem 3rem 3rem',
              color: 'var(--color-text-secondary)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = 'var(--color-surface-2)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = 'transparent';
            }}
          >
            <span className="truncate font-mono" style={{ color: 'var(--color-text-primary)' }}>
              {proc.name}
            </span>
            <span className={`text-right metric-value ${proc.cpu > 50 ? 'text-[var(--color-danger)]' : proc.cpu > 20 ? 'text-[var(--color-warn)]' : ''}`}>
              {proc.cpu.toFixed(1)}
            </span>
            <span className={`text-right metric-value ${proc.mem > 50 ? 'text-[var(--color-danger)]' : proc.mem > 20 ? 'text-[var(--color-warn)]' : ''}`}>
              {proc.mem.toFixed(1)}
            </span>
            <span className="text-right font-mono" style={{ color: 'var(--color-text-muted)' }}>
              {proc.pid}
            </span>
          </div>
        ))}

        {processes.length === 0 && (
          <div className="py-6 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
            No process data
          </div>
        )}
      </div>
    </div>
  );
}
