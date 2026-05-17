import { createRequire } from 'module';
import si from 'systeminformation';

const require = createRequire(import.meta.url);
const piModels = require('./pi-models.json') as PiModelsConfig;

interface PiThresholds {
  chipset: string;
  throttle_onset: number;
  throttle_hard: number;
  critical: number;
}

interface PiModelsConfig {
  models: Array<{ match: string[]; chipset: string; throttle_onset: number; throttle_hard: number; critical: number }>;
  default: PiThresholds;
}

let cachedThresholds: PiThresholds | null = null;

export async function getPiThresholds(): Promise<PiThresholds> {
  if (cachedThresholds) return cachedThresholds;

  try {
    const cpu = await si.cpu();
    const model = cpu.model ?? '';

    for (const entry of piModels.models) {
      if (entry.match.some((keyword) => model.includes(keyword))) {
        cachedThresholds = {
          chipset: entry.chipset,
          throttle_onset: entry.throttle_onset,
          throttle_hard: entry.throttle_hard,
          critical: entry.critical,
        };
        return cachedThresholds;
      }
    }
  } catch {
    // Fall through to default
  }

  cachedThresholds = piModels.default;
  return cachedThresholds;
}

export type { PiThresholds };
