import { HassEntity } from "home-assistant-js-websocket";
import { computeDomain } from "../common/entity/compute_domain";

export const UNAVAILABLE = "unavailable";
export const UNKNOWN = "unknown";

export const ON = "on";
export const OFF = "off";

const OFF_STATES = [UNAVAILABLE, UNKNOWN, OFF];

export function isActive(stateObj: HassEntity) {
  const domain = computeDomain(stateObj.entity_id);
  const state = stateObj.state;

  if (["button", "input_button", "scene"].includes(domain)) {
    return state !== UNAVAILABLE;
  }

  if (OFF_STATES.includes(state)) {
    return false;
  }

  // Custom cases
  switch (domain) {
    case "cover":
    case "valve":
      return !["closed", "closing"].includes(state);
    case "device_tracker":
    case "person":
      return state !== "not_home";
    case "media_player":
      return state !== "standby";
    case "vacuum":
      return !["idle", "docked", "paused"].includes(state);
    case "plant":
      return state === "problem";
    default:
      return true;
  }
}

export function isAvailable(stateObj: HassEntity) {
  return stateObj.state !== UNAVAILABLE;
}

export function isOff(stateObj: HassEntity) {
  return stateObj.state === OFF;
}

export function isUnknown(stateObj: HassEntity) {
  return stateObj.state === UNKNOWN;
}

export function getEntityPicture(stateObj: HassEntity) {
  return (
    (stateObj.attributes.entity_picture_local as string | undefined) ||
    stateObj.attributes.entity_picture
  );
}
