import { HassEntity } from "home-assistant-js-websocket";

export const UNAVAILABLE = "unavailable";
export const UNKNOWN = "unknown";

export const ON = "on";
export const OFF = "off";

export function isActive(entity: HassEntity) {
    const domain = entity.entity_id.split(".")[0];
    const state = entity.state;
    if (state === UNAVAILABLE || state === UNKNOWN || state === OFF) return false;

    // Custom cases
    switch (domain) {
        case "alarm_control_panel":
            return state !== "disarmed";
        case "lock":
            return state !== "unlocked";
        case "cover":
            return state === "open" || state === "opening";
        case "device_tracker":
        case "person":
            return state === "home";
        case "vacuum":
            return state === "cleaning" || state === "on";
        case "plant":
            return state === "problem";
        default:
            return true;
    }
}

export function isAvailable(entity: HassEntity) {
    return entity.state !== UNAVAILABLE;
}

export function isOff(entity: HassEntity) {
    return entity.state === OFF;
}

export function isUnknown(entity: HassEntity) {
    return entity.state === UNKNOWN;
}
