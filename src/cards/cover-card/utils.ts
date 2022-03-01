import { HassEntity } from "home-assistant-js-websocket";
import { supportsFeature } from "../../utils/entity";

const SUPPORT_OPEN = 1;
const SUPPORT_CLOSE = 2;
const SUPPORT_SET_POSITION = 4;
const SUPPORT_STOP = 8;
const SUPPORT_OPEN_TILT = 16;
const SUPPORT_CLOSE_TILT = 32;
const SUPPORT_STOP_TILT = 64;
const SUPPORT_SET_TILT_POSITION = 128;

export const supportsOpen = (entity: HassEntity) => supportsFeature(entity, SUPPORT_OPEN);

export const supportsClose = (entity: HassEntity) => supportsFeature(entity, SUPPORT_CLOSE);

export const supportsSetPosition = (entity: HassEntity) =>
    supportsFeature(entity, SUPPORT_SET_POSITION);

export const supportsStop = (entity: HassEntity) => supportsFeature(entity, SUPPORT_STOP);

export const supportsOpenTilt = (entity: HassEntity) => supportsFeature(entity, SUPPORT_OPEN_TILT);

export const supportsCloseTilt = (entity: HassEntity) =>
    supportsFeature(entity, SUPPORT_CLOSE_TILT);

export const supportsStopTilt = (entity: HassEntity) => supportsFeature(entity, SUPPORT_STOP_TILT);

export const supportsSetTiltPosition = (entity: HassEntity) =>
    supportsFeature(entity, SUPPORT_SET_TILT_POSITION);

export function getPosition(entity: HassEntity) {
    return entity.attributes.current_position != null
        ? (entity.attributes.current_position as number)
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
