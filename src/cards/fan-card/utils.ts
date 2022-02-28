import { HassEntity } from "home-assistant-js-websocket";

export function getPercentage(entity: HassEntity) {
    return entity.attributes.percentage != null
        ? Math.round(entity.attributes.percentage)
        : undefined;
}

export function getPresetModes(entity: HassEntity) {
    return entity.attributes.preset_modes;
}

export function isAuto(entity: HassEntity) {
    const validAutoModes = ["auto", "smart", "woosh", "eco", "breeze"];
    return entity.attributes.preset_mode != null ? Boolean(validAutoModes.includes(entity.attributes.preset_mode.toLowerCase())) : false;
}

export function isOscillating(entity: HassEntity) {
    return entity.attributes.oscillating != null ? Boolean(entity.attributes.oscillating) : false;
}
