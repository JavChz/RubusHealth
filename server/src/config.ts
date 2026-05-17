import { homedir } from 'os';
import { join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

export const DEFAULT_PORT = 48721;

export const DATA_DIR = join(homedir(), '.rubushealth', 'data');
export const SETTINGS_FILE = join(DATA_DIR, 'settings.json');
export const DB_FILE = join(DATA_DIR, 'metrics.db');

// Ensure data directory exists at startup
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

export interface AppSettings {
  port: number;
  autostart: boolean;
  collectIntervalSeconds: number;
  retentionHours: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  port: DEFAULT_PORT,
  autostart: true,
  collectIntervalSeconds: 15,
  retentionHours: 24,
};

export function loadSettings(): AppSettings {
  try {
    if (existsSync(SETTINGS_FILE)) {
      const raw = readFileSync(SETTINGS_FILE, 'utf8');
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    console.warn('[config] Could not load settings, using defaults');
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  const current = loadSettings();
  const updated = { ...current, ...settings };
  writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf8');
  return updated;
}
