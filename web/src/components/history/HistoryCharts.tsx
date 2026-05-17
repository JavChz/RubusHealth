import { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart2 } from 'lucide-react';
import { api, type HistoryPoint } from '../../lib/api';
import { Skeleton } from '../ui/Skeleton';

type Range = '30m' | '1h' | '6h' | '24h';
type Metric = 'cpu' | 'temp' | 'ram' | 'disk';

const RANGES: Range[] = ['30m', '1h', '6h', '24h'];
const METRICS: { key: Metric; label: string; color: string; unit: string }[] = [
  { key: 'cpu', label: 'CPU', color: 'var(--color-accent)', unit: '%' },
  { key: 'temp', label: 'Temp', color: 'var(--color-warn)', unit: '°C' },
  { key: 'ram', label: 'RAM', color: 'var(--color-ok)', unit: '%' },
  { key: 'disk', label: 'Disk', color: 'var(--color-danger)', unit: '%' },
];

function formatTimestamp(ts: number, range: Range): string {
  const date = new Date(ts);
  if (range === '24h') return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 text-xs space-y-1.5"
      style={{
        background: 'var(--color-surface-1)',
        border: '1px solid var(--color-border-strong)',
        boxShadow: 'var(--shadow-card)',
        minWidth: 140,
      }}
    >
      <p className="font-mono mb-2" style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>{label}</p>
      {payload.map((entry: { name: string; value: number; color: string; unit?: string }) => (
        <div key={entry.name} className="flex justify-between gap-4">
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span className="metric-value font-mono" style={{ color: 'var(--color-text-primary)' }}>
            {entry.value.toFixed(1)}{entry.unit}
          </span>
        </div>
      ))}
    </div>
  );
}

export function HistoryCharts() {
  const [range, setRange] = useState<Range>('1h');
  const [activeMetrics, setActiveMetrics] = useState<Set<Metric>>(new Set(['cpu', 'temp']));
  const [data, setData] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const result = await api.getHistory(range);
      setData(result.data);
    } catch (err) {
      console.error('History fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 30_000);
    return () => clearInterval(interval);
  }, [fetchHistory]);

  const toggleMetric = (m: Metric) => {
    setActiveMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(m)) {
        if (next.size === 1) return prev; // keep at least one
        next.delete(m);
      } else {
        next.add(m);
      }
      return next;
    });
  };

  const chartData = data.map((d) => ({
    ...d,
    time: formatTimestamp(d.timestamp, range),
  }));

  return (
    <div className="card p-5 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-1.5">
          <BarChart2 size={14} style={{ color: 'var(--color-text-muted)' }} />
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            History
          </span>
        </div>

        {/* Range selector */}
        <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: 'var(--color-surface-2)' }}>
          {RANGES.map((r) => (
            <button
              key={r}
              id={`history-range-${r}`}
              onClick={() => setRange(r)}
              className="px-3 py-1 rounded-md text-xs font-medium transition-all"
              style={{
                background: range === r ? 'var(--color-surface-3)' : 'transparent',
                color: range === r ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Metric toggles */}
      <div className="flex flex-wrap gap-2 mb-4">
        {METRICS.map((m) => (
          <button
            key={m.key}
            id={`history-toggle-${m.key}`}
            onClick={() => toggleMetric(m.key)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all"
            style={{
              background: activeMetrics.has(m.key) ? `${m.color}18` : 'var(--color-surface-2)',
              border: `1px solid ${activeMetrics.has(m.key) ? `${m.color}40` : 'var(--color-border)'}`,
              color: activeMetrics.has(m.key) ? m.color : 'var(--color-text-muted)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />
            {m.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      {loading ? (
        <div className="skeleton w-full rounded-lg" style={{ height: 200 }} />
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          No historical data yet — collecting every 15s
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              {METRICS.map((m) => (
                <linearGradient key={m.key} id={`grad-${m.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={m.color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={m.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            {METRICS.filter((m) => activeMetrics.has(m.key)).map((m) => (
              <Area
                key={m.key}
                type="monotone"
                dataKey={m.key}
                name={m.label}
                stroke={m.color}
                strokeWidth={1.5}
                fill={`url(#grad-${m.key})`}
                dot={false}
                activeDot={{ r: 3, fill: m.color }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      )}

      {data.length > 0 && (
        <p className="text-right text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
          {data.length} data points · updates every 30s
        </p>
      )}
    </div>
  );
}
