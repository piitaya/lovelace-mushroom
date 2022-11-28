import { HassEntity } from "home-assistant-js-websocket";

export function getCurrentOption(entity: HassEntity) {
    return entity.attributes.current_option != null
        ? entity.attributes.current_option
        : undefined;
}

export function getOptions(entity: HassEntity) {
    return entity.attributes.options;
}
