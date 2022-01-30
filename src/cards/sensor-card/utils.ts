import { HassEntity } from "home-assistant-js-websocket";

export function isActive(entity: HassEntity) {
    const domain = entity.entity_id.split(".")[0];
    const state = entity.state;
    return domain === "binary_sensor"
        ? state === "on"
        : state !== "unavailable";
}
