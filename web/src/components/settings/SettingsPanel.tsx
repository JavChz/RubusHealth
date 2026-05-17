import { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Power, Download, Trash2, ExternalLink, CheckCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { useSettingsStore } from '../../store/useSettingsStore';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { settings, setSettings } = useSettingsStore();
  const [port, setPort] = useState(settings?.port ?? 48721);
  const [collectInterval, setCollectInterval] = useState(settings?.collectIntervalSeconds ?? 15);
  const [retentionHours, setRetentionHours] = useState(settings?.retentionHours ?? 24);
  const [saving, setSaving] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setPort(settings.port);
      setCollectInterval(settings.collectIntervalSeconds);
      setRetentionHours(settings.retentionHours);
    }
  }, [settings]);

  // Close on backdrop click
  if (!open) return null;

  async function handleSave() {
    setSaving(true);
    try {
      const result = await api.updateSettings({
        port,
        collectIntervalSeconds: collectInterval,
        retentionHours,
      });
      setSettings(result.settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleRestart() {
    setRestarting(true);
    try {
      await api.restartService();
      setTimeout(() => setRestarting(false), 3000);
    } catch {
      setRestarting(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 transition-opacity duration-300"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm overflow-y-auto"
        style={{
          background: 'var(--color-surface-1)',
          borderLeft: '1px solid var(--color-border)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sticky top-0"
          style={{
            background: 'rgba(15,23,42,0.95)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <h2 className="font-semibold text-base" style={{ color: 'var(--color-text-primary)' }}>
            Settings
          </h2>
          <button
            id="close-settings"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Close settings"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Server section */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: 'var(--color-text-muted)' }}>
              Server
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Port
                </label>
                <input
                  id="settings-port"
                  type="number"
                  min={1024}
                  max={65535}
                  value={port}
                  onChange={(e) => setPort(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg text-sm font-mono outline-none transition-all"
                  style={{
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Requires service restart to take effect
                </p>
              </div>
            </div>
          </section>

          {/* Data collection */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: 'var(--color-text-muted)' }}>
              Data Collection
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Collection interval (seconds)
                </label>
                <input
                  id="settings-interval"
                  type="number"
                  min={5}
                  max={300}
                  value={collectInterval}
                  onChange={(e) => setCollectInterval(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg text-sm font-mono outline-none"
                  style={{
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
                />
              </div>
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Data retention (hours)
                </label>
                <input
                  id="settings-retention"
                  type="number"
                  min={1}
                  max={168}
                  value={retentionHours}
                  onChange={(e) => setRetentionHours(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg text-sm font-mono outline-none"
                  style={{
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
                />
              </div>
            </div>
          </section>

          {/* Save button */}
          <button
            id="settings-save"
            onClick={handleSave}
            disabled={saving || saved}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: saved ? 'var(--color-ok-dim)' : 'var(--color-accent)',
              color: saved ? 'var(--color-ok)' : 'white',
              border: saved ? '1px solid rgba(34,211,165,0.3)' : 'none',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saved ? (
              <><CheckCircle size={14} /> Saved!</>
            ) : (
              <><Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}</>
            )}
          </button>

          {/* Service actions */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: 'var(--color-text-muted)' }}>
              Service
            </h3>
            <div className="space-y-2">
              <button
                id="settings-restart"
                onClick={handleRestart}
                disabled={restarting}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all"
                style={{
                  background: 'var(--color-surface-2)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                  opacity: restarting ? 0.6 : 1,
                }}
              >
                <RotateCcw size={15} style={{ color: 'var(--color-accent)' }} />
                {restarting ? 'Restarting...' : 'Restart Service'}
              </button>

              <button
                id="settings-export"
                onClick={api.exportSettings}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all"
                style={{
                  background: 'var(--color-surface-2)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <Download size={15} style={{ color: 'var(--color-ok)' }} />
                Export Settings
              </button>
            </div>
          </section>

          {/* Links */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: 'var(--color-text-muted)' }}>
              Resources
            </h3>
            <div className="space-y-2">
              <a
                href="/api/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all"
                style={{
                  background: 'var(--color-surface-2)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                  textDecoration: 'none',
                }}
              >
                <span className="flex items-center gap-3">
                  <ExternalLink size={15} style={{ color: 'var(--color-accent)' }} />
                  API Documentation
                </span>
                <ExternalLink size={11} style={{ color: 'var(--color-text-muted)' }} />
              </a>
            </div>
          </section>

          {/* Danger zone */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: 'var(--color-danger)' }}>
              Danger Zone
            </h3>
            <div
              className="rounded-xl p-4 text-xs space-y-2"
              style={{
                background: 'var(--color-danger-dim)',
                border: '1px solid rgba(244,63,94,0.15)',
              }}
            >
              <p style={{ color: 'var(--color-text-secondary)' }}>
                To uninstall RubusHealth, run:
              </p>
              <code
                className="block px-3 py-2 rounded-lg font-mono text-xs select-all"
                style={{
                  background: 'var(--color-surface-2)',
                  color: 'var(--color-danger)',
                  border: '1px solid rgba(244,63,94,0.2)',
                }}
              >
                rubushealth uninstall
              </code>
              <div className="flex items-center gap-2 pt-1" style={{ color: 'var(--color-text-muted)' }}>
                <Power size={12} />
                <span>This will stop and remove the service.</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                <Trash2 size={12} />
                <span>All data in ~/.rubushealth will be removed.</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
