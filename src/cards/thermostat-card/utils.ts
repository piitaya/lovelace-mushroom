import { formatNumber, HomeAssistant, UNIT_F } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { isNumber } from "../../utils/number";
import { HVAC_MODE_ORDERING } from "./const";
import { HvacMode } from "./types";

export const compareClimateHvacModes = (mode1: HvacMode, mode2: HvacMode) =>
    HVAC_MODE_ORDERING[mode1] - HVAC_MODE_ORDERING[mode2];

export const formatDegrees = (hass: HomeAssistant, value: number | undefined, step: number) => {
    if (!isNumber(value)) return null;
    const options: Intl.NumberFormatOptions =
        step === 1
            ? { maximumFractionDigits: 0 }
            : { maximumFractionDigits: 1, minimumFractionDigits: 1 };
    return +formatNumber(value!, hass.locale, options);
};

export const getStepSize = (hass: HomeAssistant, entity: HassEntity): number => {
    const systemStep = hass.config.unit_system.temperature === UNIT_F ? 1 : 0.5;
    return entity.attributes.target_temp_step ?? systemStep;
};

export const getTargetTemps = (entity: HassEntity): [number | undefined, number | undefined] => {
    const { target_temp_high, target_temp_low, temperature } = entity.attributes;

    if (entity.state === "heat") return [target_temp_low ?? temperature, undefined];
    if (entity.state === "cool") return [undefined, target_temp_high ?? temperature];
    return [target_temp_low, target_temp_high];
};
