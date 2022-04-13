import { HassEntity } from "home-assistant-js-websocket";
import {
    STATE_CLEANING,
    STATE_DOCKED,
    STATE_IDLE,
    STATE_OFF,
    STATE_ON,
    STATE_RETURNING,
} from "../../ha/data/vacuum";

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
