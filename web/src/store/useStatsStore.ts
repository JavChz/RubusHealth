import { create } from 'zustand';
import type { SystemStats } from '../lib/api';

interface StatsState {
  stats: SystemStats | null;
  prevStats: SystemStats | null;
  isLoading: boolean;
  setStats: (stats: SystemStats) => void;
  setLoading: (loading: boolean) => void;
}

export const useStatsStore = create<StatsState>((set) => ({
  stats: null,
  prevStats: null,
  isLoading: true,
  setStats: (stats) =>
    set((state) => ({ stats, prevStats: state.stats, isLoading: false })),
  setLoading: (isLoading) => set({ isLoading }),
}));
