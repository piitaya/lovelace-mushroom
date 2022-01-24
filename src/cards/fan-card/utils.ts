import { HassEntity } from "home-assistant-js-websocket";

export function getPercentage(entity: HassEntity) {
    return entity.attributes.percentage != null
        ? Math.round(entity.attributes.percentage)
        : undefined;
}

export function isActive(entity: HassEntity) {
    return entity.state === "on";
}
