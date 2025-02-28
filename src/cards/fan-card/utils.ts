import { HassEntity } from "home-assistant-js-websocket";

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
