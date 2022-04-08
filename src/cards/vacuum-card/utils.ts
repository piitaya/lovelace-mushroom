import { HassEntity } from "home-assistant-js-websocket";
import { supportsFeature, UNAVAILABLE } from "../../utils/entity";
import {
    STATE_CLEANING,
    STATE_DOCKED,
    STATE_IDLE,
    STATE_OFF,
    STATE_ON,
    STATE_RETURNING,
    SUPPORT_CLEAN_SPOT,
    SUPPORT_LOCATE,
    SUPPORT_MAP,
    SUPPORT_PAUSE,
    SUPPORT_RETURN_HOME,
    SUPPORT_START,
    SUPPORT_STATE,
    SUPPORT_STOP,
    SUPPORT_TURN_OFF,
    SUPPORT_TURN_ON,
} from "./const";

export function isUnavailable(entity: HassEntity): boolean {
    return entity.state === UNAVAILABLE;
}

export function isCleaning(entity: HassEntity): boolean {
    switch (entity.state) {
        case STATE_CLEANING:
        case STATE_ON:
            return true;
        default:
            return false;
    }
}

export function isStopped(entity: HassEntity): boolean {
    switch (entity.state) {
        case STATE_DOCKED:
        case STATE_OFF:
        case STATE_IDLE:
        case STATE_RETURNING:
            return true;
        default:
            return false;
    }
}

export function isReturningHome(entity: HassEntity): boolean {
    switch (entity.state) {
        case STATE_RETURNING:
        case STATE_OFF:
            return true;
        default:
            return false;
    }
}

export const supportsTurnOn = (entity: HassEntity) => supportsFeature(entity, SUPPORT_TURN_ON);
export const supportsTurnOff = (entity: HassEntity) => supportsFeature(entity, SUPPORT_TURN_OFF);
export const supportsPause = (entity: HassEntity) => supportsFeature(entity, SUPPORT_PAUSE);
export const supportsStop = (entity: HassEntity) => supportsFeature(entity, SUPPORT_STOP);
export const supportsReturnHome = (entity: HassEntity) =>
    supportsFeature(entity, SUPPORT_RETURN_HOME);
export const supportsLocate = (entity: HassEntity) => supportsFeature(entity, SUPPORT_LOCATE);
export const supportsCleanSpot = (entity: HassEntity) =>
    supportsFeature(entity, SUPPORT_CLEAN_SPOT);
export const supportsMap = (entity: HassEntity) => supportsFeature(entity, SUPPORT_MAP);
export const supportsState = (entity: HassEntity) => supportsFeature(entity, SUPPORT_STATE);
export const supportsStart = (entity: HassEntity) => supportsFeature(entity, SUPPORT_START);
