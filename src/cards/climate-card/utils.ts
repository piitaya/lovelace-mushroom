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
    auto: "mdi:calendar-sync",
    cool: "mdi:snowflake",
    dry: "mdi:water-percent",
    fan_only: "mdi:fan",
    heat: "mdi:fire",
    heat_cool: "mdi:autorenew",
    off: "mdi:power",
};

export const CLIMATE_HVAC_ACTION_ICONS: Record<HvacAction, string> = {
    cooling: "mdi:snowflake",
    drying: "mdi:water-percent",
    heating: "mdi:fire",
    idle: "mdi:timer-sand-full",
    off: "mdi:power",
};

export function getHvacModeColor(hvacMode: HvacMode): string {
    return CLIMATE_HVAC_MODE_COLORS[hvacMode] ?? CLIMATE_HVAC_MODE_COLORS.off;
}

export function getHvacActionColor(hvacAction: HvacAction): string {
    return CLIMATE_HVAC_ACTION_COLORS[hvacAction] ?? CLIMATE_HVAC_ACTION_COLORS.off;
}

export function getHvacModeIcon(hvacMode: HvacMode): string {
    return CLIMATE_HVAC_MODE_ICONS[hvacMode] ?? "mdi:thermostat";
}

export function getHvacActionIcon(hvacAction: HvacAction): string | undefined {
    return CLIMATE_HVAC_ACTION_ICONS[hvacAction] ?? "";
}
