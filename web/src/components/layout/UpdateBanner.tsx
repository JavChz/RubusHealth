import { useState } from 'react';
import { X, Download } from 'lucide-react';

interface UpdateBannerProps {
  latestVersion: string;
}

export function UpdateBanner({ latestVersion }: UpdateBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className="slide-down flex items-center justify-between px-4 py-2.5 text-sm"
      style={{
        background: 'linear-gradient(90deg, var(--color-warn-dim), rgba(245,158,11,0.06))',
        borderBottom: '1px solid var(--color-warn)/30',
      }}
    >
      <div className="flex items-center gap-2">
        <Download size={14} style={{ color: 'var(--color-warn)' }} />
        <span style={{ color: 'var(--color-warn)' }}>
          Update available — v{latestVersion}
        </span>
        <span style={{ color: 'var(--color-text-muted)' }}>
          · Run <code className="font-mono text-xs px-1 py-0.5 rounded"
            style={{ background: 'var(--color-surface-2)' }}>
            rubushealth update
          </code> to install
        </span>
      </div>
      <button
        id="dismiss-update-banner"
        onClick={() => setDismissed(true)}
        className="ml-4 flex-shrink-0"
        style={{ color: 'var(--color-text-muted)' }}
        aria-label="Dismiss update notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}
