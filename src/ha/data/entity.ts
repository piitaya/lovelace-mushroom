import { HassEntity } from "home-assistant-js-websocket";
import { computeDomain } from "../common/entity/compute-domain";

export const UNAVAILABLE = "unavailable";
export const UNKNOWN = "unknown";

export const ON = "on";
export const OFF = "off";

const OFF_STATES = [UNAVAILABLE, UNKNOWN, OFF];

export function isActive(entity: HassEntity) {
    const domain = computeDomain(entity.entity_id);
    const state = entity.state;

    if (["button", "input_button", "scene"].includes(domain)) {
        return state !== UNAVAILABLE;
    }

    if (OFF_STATES.includes(state)) {
        return false;
    }

    // Custom cases
    switch (domain) {
        case "cover":
            return !["closed", "closing"].includes(state);
        case "device_tracker":
        case "person":
            return state !== "not_home";
        case "media_player":
            return state !== "standby";
        case "vacuum":
            return !["idle", "docked", "paused"].includes(state);
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
