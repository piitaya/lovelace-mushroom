import { HassEntity } from "home-assistant-js-websocket";

export function getPosition(entity: HassEntity) {
    return entity.attributes.current_position != null
        ? entity.attributes.current_position
        : undefined;
}

export function isFullyOpen(entity: HassEntity) {
    if (entity.attributes.current_position !== undefined) {
        return entity.attributes.current_position === 100;
    }
    return entity.state === "open";
}

export function isFullyClosed(entity: HassEntity) {
    if (entity.attributes.current_position !== undefined) {
        return entity.attributes.current_position === 0;
    }
    return entity.state === "closed";
}

export function isOpening(entity: HassEntity) {
    return entity.state === "opening";
}

export function isClosing(entity: HassEntity) {
    return entity.state === "closing";
}

export function isActive(entity: HassEntity) {
    return entity.state === "open" || entity.state === "opening";
}
