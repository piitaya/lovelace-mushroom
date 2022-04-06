import { HassEntity } from "home-assistant-js-websocket";
import { HVAC_MODE_ORDERING } from "./const";
import { HvacMode } from "./types";

export const compareClimateHvacModes = (mode1: HvacMode, mode2: HvacMode) =>
    HVAC_MODE_ORDERING[mode1] - HVAC_MODE_ORDERING[mode2];

export const getSetTemp = (entity: HassEntity): number | [number, number] => {
    if (entity.attributes.target_temp_low && entity.attributes.target_temp_high) {
        return [entity.attributes.target_temp_low, entity.attributes.target_temp_high];
    }

    return entity.attributes.temperature;
};
