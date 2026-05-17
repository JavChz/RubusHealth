import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const localVersion: string = JSON.parse(
  readFileSync(resolve(__dirname, '../../../version.json'), 'utf8')
).version;

const GITHUB_VERSION_URL =
  'https://raw.githubusercontent.com/JavChz/RubusHealth/main/version.json';

let cachedCheck: { result: boolean; latest: string; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export function getLocalVersion(): string {
  return localVersion;
}

export async function checkForUpdate(): Promise<{
  updateAvailable: boolean;
  currentVersion: string;
  latestVersion: string;
}> {
  const now = Date.now();
  if (cachedCheck && now - cachedCheck.timestamp < CACHE_TTL_MS) {
    return {
      updateAvailable: cachedCheck.result,
      currentVersion: localVersion,
      latestVersion: cachedCheck.latest,
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(GITHUB_VERSION_URL, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error('Non-OK response');
    const data = (await res.json()) as { version: string };
    const latestVersion = data.version;

    const updateAvailable = compareVersions(latestVersion, localVersion) > 0;
    cachedCheck = { result: updateAvailable, latest: latestVersion, timestamp: now };

    return { updateAvailable, currentVersion: localVersion, latestVersion };
  } catch {
    // Network unavailable or timeout — return no-update to avoid noise
    return {
      updateAvailable: false,
      currentVersion: localVersion,
      latestVersion: localVersion,
    };
  }
}

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}
