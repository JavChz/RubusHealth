import { Activity, Settings } from 'lucide-react';
import { useConnectionStore } from '../../store/useConnectionStore';
import { useStatsStore } from '../../store/useStatsStore';
import { Badge } from '../ui/Badge';

interface HeaderProps {
  onSettingsOpen: () => void;
}

export function Header({ onSettingsOpen }: HeaderProps) {
  const { status } = useConnectionStore();
  const { stats } = useStatsStore();

  const hostname = stats?.system.hostname ?? 'raspberrypi';

  const connectionBadge = {
    connecting: { label: 'Connecting...', variant: 'neutral' as const, dot: false },
    online:     { label: 'Online', variant: 'ok' as const, dot: true },
    offline:    { label: 'Offline', variant: 'danger' as const, dot: true },
  }[status];

  return (
    <header className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between"
      style={{
        background: 'rgba(10, 15, 30, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ background: 'var(--color-accent-dim)', border: '1px solid var(--color-accent)/30' }}>
          <Activity size={16} style={{ color: 'var(--color-accent)' }} strokeWidth={2.5} />
        </div>
        <div>
          <div className="font-semibold text-sm text-[var(--color-text-primary)] leading-none">
            RubusHealth
          </div>
          <div className="text-xs text-[var(--color-text-muted)] leading-none mt-0.5 font-mono">
            {hostname}
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <Badge
          label={connectionBadge.label}
          variant={connectionBadge.variant}
          dot={connectionBadge.dot}
        />
        <button
          id="settings-btn"
          onClick={onSettingsOpen}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-primary)';
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface-2)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-secondary)';
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
          title="Settings"
          aria-label="Open settings"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}
