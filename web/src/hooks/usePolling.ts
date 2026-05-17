import { useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { useStatsStore } from '../store/useStatsStore';
import { useConnectionStore } from '../store/useConnectionStore';

const POLL_INTERVAL_MS = 2000;

export function usePolling() {
  const { setStats } = useStatsStore();
  const { setOnline, setOffline } = useConnectionStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;

    async function poll() {
      if (!activeRef.current) return;
      try {
        const stats = await api.getStats();
        if (activeRef.current) {
          setStats(stats);
          setOnline();
        }
      } catch {
        if (activeRef.current) {
          setOffline();
        }
      }
    }

    // Initial fetch immediately
    poll();

    timerRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      activeRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [setStats, setOnline, setOffline]);
}
