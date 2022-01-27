import { HassEntity } from "home-assistant-js-websocket";

export function getStateIcon(entity: HassEntity) {
    const state = entity.state;
    if (state === "unknown") {
        return "mdi:map-marker-alert";
    } else if (state === "home") {
        return "mdi:home";
    }
    return "mdi:pine-tree";
}

export function getStateColor(entity: HassEntity) {
    const state = entity.state;
    if (state === "unknown") {
        return "var(--state-unknown-color)";
    } else if (state === "home") {
        return "var(--state-home-color)";
    }
    return "var(--state-not_home-color)";
}

export function isActive(entity: HassEntity) {
    return entity.state === "home";
}
