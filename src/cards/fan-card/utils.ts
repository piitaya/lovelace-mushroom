import { HassEntity } from "home-assistant-js-websocket";

export function getPercentage(entity: HassEntity) {
    return entity.attributes.percentage != null
        ? Math.round(entity.attributes.percentage)
        : undefined;
}

export function isOscillating(entity: HassEntity) {
    return entity.attributes.oscillating != null ? Boolean(entity.attributes.oscillating) : false;
}

export function computePercentageStep(entity: HassEntity) {
    if (entity.attributes.percentage_step) {
        return entity.attributes.percentage_step;
    }
    return 1;
}
