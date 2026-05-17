interface ProgressRingProps {
  value: number;       // 0-100
  size?: number;       // px
  strokeWidth?: number;
  color?: string;      // CSS color
  trackColor?: string;
  label?: string;
  sublabel?: string;
  className?: string;
}

const STATUS_COLORS = {
  normal: 'var(--color-ok)',
  warn:   'var(--color-warn)',
  danger: 'var(--color-danger)',
};

export function getGaugeColor(percent: number): string {
  if (percent >= 85) return STATUS_COLORS.danger;
  if (percent >= 60) return STATUS_COLORS.warn;
  return STATUS_COLORS.normal;
}

export function ProgressRing({
  value,
  size = 96,
  strokeWidth = 8,
  color,
  trackColor = 'var(--color-surface-3)',
  label,
  sublabel,
  className = '',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(100, Math.max(0, value));
  const dashOffset = circumference * (1 - clampedValue / 100);
  const resolvedColor = color ?? getGaugeColor(value);
  const cx = size / 2;

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Track */}
        <circle
          cx={cx}
          cy={cx}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={cx}
          cy={cx}
          r={radius}
          fill="none"
          stroke={resolvedColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
        />
      </svg>
      {/* Center label */}
      {(label || sublabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {label && (
            <span className="metric-value text-[var(--color-text-primary)] font-semibold leading-none" style={{ fontSize: size * 0.18 }}>
              {label}
            </span>
          )}
          {sublabel && (
            <span className="text-[var(--color-text-muted)] leading-none mt-0.5" style={{ fontSize: size * 0.12 }}>
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
