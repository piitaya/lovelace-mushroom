import { HassEntity } from "home-assistant-js-websocket";

export function getStateIcon(entity: HassEntity, zones:HassEntity[]) {
    const state = entity.state;
    if (state === "unknown") {
        return "mdi:help";
    } else if (state === "home") {
        return "mdi:home";
    }
    const zone = zones.find(z => state === z.attributes.friendly_name);
    if (zone) {
        return zone.attributes.icon;
    }
    return "mdi:home-export-outline";
}

export function getStateColor(entity: HassEntity) {
    const state = entity.state;
    if (state === "unknown") {
        return "var(--rgb-state-person-unknown)";
    } else if (state === "home") {
        return "var(--rgb-state-person-home)";
    }
    return "var(--rgb-state-person-not-home)";
}

export function isActive(entity: HassEntity) {
    return entity.state === "home";
}
