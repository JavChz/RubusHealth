import { Thermometer, AlertTriangle, Flame, AlertOctagon } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import type { SystemStats } from '../../lib/api';

interface TemperatureCardProps {
  stats: SystemStats | null;
  loading: boolean;
}

type TempStatus = 'normal' | 'warning' | 'throttling' | 'critical';

const STATUS_CONFIG: Record<TempStatus, {
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
  description: string;
  icon: typeof Thermometer;
  glow: string;
}> = {
  normal: {
    color: 'var(--color-ok)',
    bgColor: 'var(--color-ok-dim)',
    borderColor: 'rgba(34,211,165,0.2)',
    label: 'Normal',
    description: 'Temperature is healthy',
    icon: Thermometer,
    glow: '',
  },
  warning: {
    color: 'var(--color-warn)',
    bgColor: 'var(--color-warn-dim)',
    borderColor: 'rgba(245,158,11,0.3)',
    label: 'Warm',
    description: 'Approaching throttle threshold',
    icon: AlertTriangle,
    glow: 'glow-warn',
  },
  throttling: {
    color: 'var(--color-throttle)',
    bgColor: 'var(--color-throttle-dim)',
    borderColor: 'rgba(251,146,60,0.3)',
    label: 'Throttling',
    description: 'CPU is throttling to cool down',
    icon: Flame,
    glow: 'glow-warn',
  },
  critical: {
    color: 'var(--color-danger)',
    bgColor: 'var(--color-danger-dim)',
    borderColor: 'rgba(244,63,94,0.3)',
    label: 'Critical',
    description: 'Shutdown risk — check cooling!',
    icon: AlertOctagon,
    glow: 'glow-danger',
  },
};

function TempBar({ value, thresholds }: {
  value: number;
  thresholds: { onset: number; hard: number; critical: number };
}) {
  const max = thresholds.critical + 10;
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const onsetPct = (thresholds.onset / max) * 100;
  const hardPct = (thresholds.hard / max) * 100;
  const critPct = (thresholds.critical / max) * 100;

  let barColor = 'var(--color-ok)';
  if (value >= thresholds.critical) barColor = 'var(--color-danger)';
  else if (value >= thresholds.hard) barColor = 'var(--color-throttle)';
  else if (value >= thresholds.onset) barColor = 'var(--color-warn)';

  return (
    <div className="mt-4">
      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-3)' }}>
        {/* Progress fill */}
        <div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: barColor,
            transition: 'width 0.5s ease, background 0.3s ease',
          }}
        />
        {/* Threshold markers */}
        <div className="absolute top-0 h-full w-0.5" style={{ left: `${onsetPct}%`, background: 'rgba(245,158,11,0.6)' }} />
        <div className="absolute top-0 h-full w-0.5" style={{ left: `${hardPct}%`, background: 'rgba(251,146,60,0.6)' }} />
        <div className="absolute top-0 h-full w-0.5" style={{ left: `${critPct}%`, background: 'rgba(244,63,94,0.6)' }} />
      </div>
      {/* Threshold labels */}
      <div className="relative mt-1" style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
        <span className="absolute" style={{ left: `${onsetPct}%`, transform: 'translateX(-50%)' }}>
          {thresholds.onset}°
        </span>
        <span className="absolute" style={{ left: `${hardPct}%`, transform: 'translateX(-50%)' }}>
          {thresholds.hard}°
        </span>
        <span className="absolute" style={{ left: `${critPct}%`, transform: 'translateX(-50%)' }}>
          {thresholds.critical}°
        </span>
      </div>
    </div>
  );
}

export function TemperatureCard({ stats, loading }: TemperatureCardProps) {
  if (loading && !stats) {
    return (
      <div className="card p-5 space-y-3">
        <Skeleton className="h-4 w-28" />
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    );
  }

  const temp = stats?.temperature;
  if (!temp) return null;

  const config = STATUS_CONFIG[temp.status];
  const Icon = config.icon;

  return (
    <div
      className={`card p-5 fade-in transition-all duration-500 ${config.glow}`}
      style={{ borderColor: config.borderColor }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Thermometer size={14} style={{ color: 'var(--color-text-muted)' }} />
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            CPU Temperature
          </span>
        </div>
        <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
          {temp.chipset}
        </span>
      </div>

      {/* Main value + status */}
      <div className="flex items-center gap-4">
        {/* Status icon */}
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0"
          style={{ background: config.bgColor, border: `1px solid ${config.borderColor}` }}
        >
          <Icon size={22} style={{ color: config.color }} />
        </div>

        {/* Values */}
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold metric-value" style={{ color: config.color }}>
              {temp.current > 0 ? `${temp.current.toFixed(1)}°` : '—'}
            </span>
            <span className="text-sm font-medium" style={{ color: config.color, opacity: 0.8 }}>
              {config.label}
            </span>
          </div>
          {temp.status !== 'normal' && (
            <p className="text-xs mt-0.5" style={{ color: config.color, opacity: 0.7 }}>
              ⚠ {config.description}
            </p>
          )}
          {temp.status === 'normal' && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {config.description}
            </p>
          )}
        </div>
      </div>

      {/* Temperature bar with threshold markers */}
      {temp.current > 0 && (
        <TempBar value={temp.current} thresholds={temp.thresholds} />
      )}

      {/* Threshold legend */}
      <div className="flex gap-3 mt-4 text-xs flex-wrap">
        <span style={{ color: 'var(--color-text-muted)' }}>
          Warn <span className="metric-value" style={{ color: 'var(--color-warn)' }}>{temp.thresholds.onset}°C</span>
        </span>
        <span style={{ color: 'var(--color-text-muted)' }}>
          Throttle <span className="metric-value" style={{ color: 'var(--color-throttle)' }}>{temp.thresholds.hard}°C</span>
        </span>
        <span style={{ color: 'var(--color-text-muted)' }}>
          Critical <span className="metric-value" style={{ color: 'var(--color-danger)' }}>{temp.thresholds.critical}°C</span>
        </span>
      </div>
    </div>
  );
}
