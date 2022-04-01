import { HvacAction, HvacMode } from "./types";

export const CLIMATE_CARD_NAME = `mushroom-climate-card`;
export const CLIMATE_CARD_EDITOR_NAME = `${CLIMATE_CARD_NAME}-editor`;
export const CLIMATE_ENTITY_DOMAINS = ["climate"];

export const CLIMATE_PRESET_NONE = "none";

export const ACTION_ICONS: Record<HvacAction, string> = {
    off: "mdi:power",
    heating: "mdi:fire",
    cooling: "mdi:snowflake",
    drying: "mdi:water-percent",
    idle: "mdi:thermostat",
};

export const MODE_ICONS: Record<HvacMode, string> = {
    auto: "mdi:calendar-sync",
    heat_cool: "mdi:autorenew",
    heat: "mdi:fire",
    cool: "mdi:snowflake",
    off: "mdi:power",
    fan_only: "mdi:fan",
    dry: "mdi:water-percent",
};

export const HVAC_MODE_ORDERING: Record<HvacMode, number> = {
    auto: 1,
    heat_cool: 2,
    heat: 3,
    cool: 4,
    dry: 5,
    fan_only: 6,
    off: 7,
};
