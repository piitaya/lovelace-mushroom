import { HassEntity } from "home-assistant-js-websocket";
import {
  STATE_CLEANING,
  STATE_DOCKED,
  STATE_IDLE,
  STATE_OFF,
  STATE_ON,
  STATE_RETURNING,
} from "../../ha";

export function isCleaning(stateObj: HassEntity): boolean {
  switch (stateObj.state) {
    case STATE_CLEANING:
    case STATE_ON:
      return true;
    default:
      return false;
  }
}

export function isStopped(stateObj: HassEntity): boolean {
  switch (stateObj.state) {
    case STATE_DOCKED:
    case STATE_OFF:
    case STATE_IDLE:
    case STATE_RETURNING:
      return true;
    default:
      return false;
  }
}

export function isReturningHome(stateObj: HassEntity): boolean {
  switch (stateObj.state) {
    case STATE_RETURNING:
      return true;
    default:
      return false;
  }
}
