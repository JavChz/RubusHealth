import Database from 'better-sqlite3';
import { DB_FILE } from './config.js';

export interface MetricRow {
  id: number;
  timestamp: number;
  cpu_usage: number;
  cpu_temp: number;
  ram_used: number;
  ram_total: number;
  disk_used: number;
  disk_total: number;
  net_rx: number;
  net_tx: number;
}

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_FILE);
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
    db.pragma('temp_store = MEMORY');
    db.pragma('mmap_size = 30000000');
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS metrics (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp  INTEGER NOT NULL,
      cpu_usage  REAL NOT NULL DEFAULT 0,
      cpu_temp   REAL NOT NULL DEFAULT 0,
      ram_used   INTEGER NOT NULL DEFAULT 0,
      ram_total  INTEGER NOT NULL DEFAULT 0,
      disk_used  INTEGER NOT NULL DEFAULT 0,
      disk_total INTEGER NOT NULL DEFAULT 0,
      net_rx     INTEGER NOT NULL DEFAULT 0,
      net_tx     INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp);

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

/**
 * Insert a new metric snapshot
 */
const insertStmt = () =>
  getDb().prepare(`
    INSERT INTO metrics (timestamp, cpu_usage, cpu_temp, ram_used, ram_total, disk_used, disk_total, net_rx, net_tx)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

export function insertMetric(row: Omit<MetricRow, 'id'>): void {
  insertStmt().run(
    row.timestamp,
    row.cpu_usage,
    row.cpu_temp,
    row.ram_used,
    row.ram_total,
    row.disk_used,
    row.disk_total,
    row.net_rx,
    row.net_tx
  );
}

/**
 * Retrieve historical metrics within a time range
 */
export function getHistory(fromTimestamp: number, limit = 500): MetricRow[] {
  return getDb()
    .prepare(
      `SELECT * FROM metrics WHERE timestamp >= ? ORDER BY timestamp ASC LIMIT ?`
    )
    .all(fromTimestamp, limit) as MetricRow[];
}

/**
 * Purge records older than retentionHours
 */
export function purgeOldMetrics(retentionHours: number): number {
  const cutoff = Date.now() - retentionHours * 60 * 60 * 1000;
  const result = getDb()
    .prepare(`DELETE FROM metrics WHERE timestamp < ?`)
    .run(cutoff);
  return result.changes;
}
