interface BadgeProps {
  label: string;
  variant?: 'ok' | 'warn' | 'danger' | 'throttle' | 'neutral';
  dot?: boolean;
  className?: string;
}

const VARIANT_STYLES: Record<string, string> = {
  ok:       'bg-[var(--color-ok-dim)] text-[var(--color-ok)] border border-[var(--color-ok)]/20',
  warn:     'bg-[var(--color-warn-dim)] text-[var(--color-warn)] border border-[var(--color-warn)]/20',
  danger:   'bg-[var(--color-danger-dim)] text-[var(--color-danger)] border border-[var(--color-danger)]/20',
  throttle: 'bg-[var(--color-throttle-dim)] text-[var(--color-throttle)] border border-[var(--color-throttle)]/20',
  neutral:  'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border)]',
};

const DOT_COLORS: Record<string, string> = {
  ok:       'bg-[var(--color-ok)]',
  warn:     'bg-[var(--color-warn)]',
  danger:   'bg-[var(--color-danger)]',
  throttle: 'bg-[var(--color-throttle)]',
  neutral:  'bg-[var(--color-text-muted)]',
};

export function Badge({ label, variant = 'neutral', dot = false, className = '' }: BadgeProps) {
  const style = VARIANT_STYLES[variant];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${style} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full pulse-dot ${DOT_COLORS[variant]}`}
        />
      )}
      {label}
    </span>
  );
}
