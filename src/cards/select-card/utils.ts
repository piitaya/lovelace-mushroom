import { HassEntity } from "home-assistant-js-websocket";

export function getCurrentOption(entity: HassEntity) {
    return entity.state != null ? entity.state : undefined;
}

export function getOptions(entity: HassEntity) {
    return entity.attributes.options;
}
