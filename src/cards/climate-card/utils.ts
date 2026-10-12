import { HvacAction, HvacMode } from "../../ha";

export const CLIMATE_HVAC_MODE_COLORS: Record<HvacMode, string> = {
  auto: "var(--rgb-state-climate-auto)",
  cool: "var(--rgb-state-climate-cool)",
  dry: "var(--rgb-state-climate-dry)",
  fan_only: "var(--rgb-state-climate-fan-only)",
  heat: "var(--rgb-state-climate-heat)",
  heat_cool: "var(--rgb-state-climate-heat-cool)",
  off: "var(--rgb-state-climate-off)",
};

export const CLIMATE_HVAC_ACTION_COLORS: Record<HvacAction, string> = {
  cooling: "var(--rgb-state-climate-cool)",
  drying: "var(--rgb-state-climate-dry)",
  heating: "var(--rgb-state-climate-heat)",
  idle: "var(--rgb-state-climate-idle)",
  off: "var(--rgb-state-climate-off)",
};

export const CLIMATE_HVAC_MODE_ICONS: Record<HvacMode, string> = {
  auto: "mdi:thermostat-auto",
  cool: "mdi:snowflake",
  dry: "mdi:water-percent",
  fan_only: "mdi:fan",
  heat: "mdi:fire",
  heat_cool: "mdi:sun-snowflake-variant",
  off: "mdi:power",
};

export const CLIMATE_HVAC_ACTION_ICONS: Record<HvacAction, string> = {
  cooling: "mdi:snowflake",
  drying: "mdi:water-percent",
  heating: "mdi:fire",
  idle: "mdi:clock-outline",
  off: "mdi:power",
};

// Just a collection of best guesses of presets, fan modes, and swing modes.
export const CLIMATE_ARBITRARY_MODE_ICONS: Record<string, string> = {
  none: "mdi:circle-off-outline",
  off: "mdi:power",
  home: "mdi:home",
  eco: "mdi:sprout",
  away: "mdi:home-outline",

  // Fan modes
  auto: "mdi:fan-auto",
  on_low: "mdi:fan-speed-1",
  on_high: "mdi:fan-speed-3",
  auto_low: "mdi:fan-speed-1",
  auto_high: "mdi:fan-speed-3",
  "1": "mdi:fan-speed-1",
  "2": "mdi:fan-speed-2",
  "3": "mdi:fan-speed-3",
  low: "mdi:fan-speed-1",
  medium: "mdi:fan-speed-2",
  high: "mdi:fan-speed-3",
  silent: "mdi:volume-off",
  turbo: "mdi:rocket-launch",
  boost: "mdi:chevron-triple-up",

  // Swing modes
  both: "mdi:arrow-all",
  vertical: "mdi:arrow-up-down",
  horizontal: "mdi:arrow-left-right",

  // Presets
  sleep: "mdi:power-sleep",
  "freeze protection": "mdi:snowflake-alert",
  Off: "mdi:power",
  "Eco Mode": "mdi:leaf",
  "Heat Pump": "mdi:heat-pump",
  "High Demand": "mdi:gauge-full",
  Electric: "mdi:lightning-bolt",
};

export function getHvacModeColor(hvacMode: HvacMode): string {
  return CLIMATE_HVAC_MODE_COLORS[hvacMode] ?? CLIMATE_HVAC_MODE_COLORS.off;
}

export function getHvacActionColor(hvacAction: HvacAction): string {
  return (
    CLIMATE_HVAC_ACTION_COLORS[hvacAction] ?? CLIMATE_HVAC_ACTION_COLORS.off
  );
}

export function getHvacModeIcon(hvacMode: HvacMode): string {
  return CLIMATE_HVAC_MODE_ICONS[hvacMode] ?? "mdi:thermostat";
}

export function getHvacActionIcon(hvacAction: HvacAction): string | undefined {
  return CLIMATE_HVAC_ACTION_ICONS[hvacAction] ?? "";
}

export function getArbitraryModeIcon(mode: string): string {
  return CLIMATE_ARBITRARY_MODE_ICONS[mode] ?? "mdi:thermostat";
}
