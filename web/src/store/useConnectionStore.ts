import { create } from 'zustand';

type ConnectionStatus = 'connecting' | 'online' | 'offline';

interface ConnectionState {
  status: ConnectionStatus;
  lastSeen: number | null;
  consecutiveErrors: number;
  setOnline: () => void;
  setOffline: () => void;
  setConnecting: () => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  status: 'connecting',
  lastSeen: null,
  consecutiveErrors: 0,
  setOnline: () =>
    set({ status: 'online', lastSeen: Date.now(), consecutiveErrors: 0 }),
  setOffline: () =>
    set((state) => ({
      status: 'offline',
      consecutiveErrors: state.consecutiveErrors + 1,
    })),
  setConnecting: () => set({ status: 'connecting' }),
}));
