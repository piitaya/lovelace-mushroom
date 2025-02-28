import { HassEntity } from "home-assistant-js-websocket";

export function getCurrentOption(stateObj: HassEntity) {
  return stateObj.state != null ? stateObj.state : undefined;
}

export function getOptions(stateObj: HassEntity) {
  return stateObj.attributes.options;
}
