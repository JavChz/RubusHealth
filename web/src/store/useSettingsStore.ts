import { create } from 'zustand';
import type { AppSettings } from '../lib/api';

interface SettingsState {
  settings: AppSettings | null;
  isLoading: boolean;
  setSettings: (s: AppSettings) => void;
  setLoading: (loading: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  isLoading: true,
  setSettings: (settings) => set({ settings, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
