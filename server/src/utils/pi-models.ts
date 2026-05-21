/**
 * Raspberry Pi model temperature thresholds.
 * throttle_onset: temp at which the Pi starts throttling (°C)
 * throttle_hard: temp at which performance is severely reduced (°C)
 * critical: temp at which the SoC may shut down for protection (°C)
 *
 * Sources:
 * - Raspberry Pi foundation documentation
 * - BCM2835/BCM2836/BCM2837/BCM2711/BCM2712 datasheets
 */
export const piModels = {
  "models": [
    {
      "match": ["Pi 1", "BCM2835", "Model A", "Model B", "Zero"],
      "chipset": "BCM2835",
      "throttle_onset": 70,
      "throttle_hard": 80,
      "critical": 85
    },
    {
      "match": ["Pi 2", "BCM2836"],
      "chipset": "BCM2836",
      "throttle_onset": 70,
      "throttle_hard": 80,
      "critical": 85
    },
    {
      "match": ["Pi 3", "BCM2837", "Pi Zero 2"],
      "chipset": "BCM2837",
      "throttle_onset": 80,
      "throttle_hard": 85,
      "critical": 90
    },
    {
      "match": ["Pi 4", "BCM2711"],
      "chipset": "BCM2711",
      "throttle_onset": 80,
      "throttle_hard": 85,
      "critical": 90
    },
    {
      "match": ["Pi 5", "BCM2712"],
      "chipset": "BCM2712",
      "throttle_onset": 85,
      "throttle_hard": 90,
      "critical": 95
    }
  ],
  "default": {
    "chipset": "Unknown",
    "throttle_onset": 80,
    "throttle_hard": 85,
    "critical": 90
  }
}
