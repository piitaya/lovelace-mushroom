import { HassEntity } from "home-assistant-js-websocket";
import { computeDomain } from "../common/entity/compute-domain";

export const UNAVAILABLE = "unavailable";
export const UNKNOWN = "unknown";

export const ON = "on";
export const OFF = "off";

const OFF_STATES = [UNAVAILABLE, UNKNOWN, OFF];
const NORMAL_UNKNOWN_DOMAIN = ["button", "input_button", "scene"];
const NORMAL_OFF_DOMAIN = ["script"];

export function isActive(entity: HassEntity) {
    const domain = computeDomain(entity.entity_id);
    const state = entity.state;

    if (
        OFF_STATES.includes(state) &&
        !(NORMAL_UNKNOWN_DOMAIN.includes(domain) && state === "unknown") &&
        !(NORMAL_OFF_DOMAIN.includes(domain) && state === "script")
    ) {
        return false;
    }

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
        case "media-player":
            return state !== "idle" && state !== "standby";
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

export function getEntityPicture(entity: HassEntity) {
    return (
        (entity.attributes.entity_picture_local as string | undefined) ||
        entity.attributes.entity_picture
    );
}
