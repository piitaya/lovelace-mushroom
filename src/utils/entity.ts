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
            return state !== "docked";
        case "plant":
            return state === "problem";
        default:
            return true;
    }
}

const AUTHORIZED_UNKNOWN_STATE_DOMAINS = ["button", "input_button", "scene"];

export function isAvailable(entity: HassEntity) {
    const domain = entity.entity_id.split(".")[0];

    return (
        entity.state !== UNAVAILABLE &&
        (entity.state !== UNKNOWN || AUTHORIZED_UNKNOWN_STATE_DOMAINS.includes(domain))
    );
}

export function isUnknown(entity: HassEntity) {
    return entity.state === UNKNOWN;
}
