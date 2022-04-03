import { HassEntity } from "home-assistant-js-websocket";
import { UNAVAILABLE } from "../../utils/entity";
import { HVAC_MODE_ORDERING } from "./const";
import { HvacMode } from "./types";

export const compareClimateHvacModes = (mode1: HvacMode, mode2: HvacMode) =>
    HVAC_MODE_ORDERING[mode1] - HVAC_MODE_ORDERING[mode2];

export const getSetTemp = (stateObj: HassEntity): number | [number, number] => {
    if (stateObj.attributes.target_temp_low && stateObj.attributes.target_temp_high) {
        return [stateObj.attributes.target_temp_low, stateObj.attributes.target_temp_high];
    }

    return stateObj.attributes.temperature;
};
