import { HvacAction, HvacMode } from "./types";

export const THERMOSTAT_CARD_NAME = `mushroom-thermostat-card`;
export const THERMOSTAT_CARD_EDITOR_NAME = `${THERMOSTAT_CARD_NAME}-editor`;
export const THERMOSTAT_ENTITY_DOMAINS = ["climate"];

export const CLIMATE_PRESET_NONE = "none";

export const HVAC_MODE_ORDERING: Record<HvacMode, number> = {
    auto: 1,
    heat_cool: 2,
    heat: 3,
    cool: 4,
    dry: 5,
    fan_only: 6,
    off: 7,
};
