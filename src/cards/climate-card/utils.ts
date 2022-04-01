import { HVAC_MODE_ORDERING } from "./const";
import { HvacMode } from "./types";

export const compareClimateHvacModes = (mode1: HvacMode, mode2: HvacMode) =>
    HVAC_MODE_ORDERING[mode1] - HVAC_MODE_ORDERING[mode2];
