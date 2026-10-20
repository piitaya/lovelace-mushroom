import { HassEntity } from "home-assistant-js-websocket";
import {
  FAN_SUPPORT_DIRECTION,
  FAN_SUPPORT_OSCILLATE,
  FAN_SUPPORT_SET_SPEED,
  supportsFeature,
} from "../../ha";

export function supportsPercentageControl(stateObj: HassEntity): boolean {
  return supportsFeature(stateObj, FAN_SUPPORT_SET_SPEED);
}

export function supportsOscillateControl(stateObj: HassEntity): boolean {
  return supportsFeature(stateObj, FAN_SUPPORT_OSCILLATE);
}

export function supportsDirectionControl(stateObj: HassEntity): boolean {
  return supportsFeature(stateObj, FAN_SUPPORT_DIRECTION);
}

export function getPercentage(stateObj: HassEntity) {
  return stateObj.attributes.percentage != null
    ? Math.round(stateObj.attributes.percentage)
    : undefined;
}

export function isOscillating(stateObj: HassEntity) {
  return stateObj.attributes.oscillating != null
    ? Boolean(stateObj.attributes.oscillating)
    : false;
}

export function computePercentageStep(stateObj: HassEntity) {
  if (stateObj.attributes.percentage_step) {
    return stateObj.attributes.percentage_step;
  }
  return 1;
}
