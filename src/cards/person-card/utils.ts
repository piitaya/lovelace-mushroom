import { HassEntity } from "home-assistant-js-websocket";
import { UNKNOWN } from "../../ha";

export function getStateIcon(stateObj: HassEntity, zones: HassEntity[]) {
  const state = stateObj.state;
  if (state === UNKNOWN) {
    return "mdi:help";
  } else if (state === "not_home") {
    return "mdi:home-export-outline";
  } else if (state === "home") {
    return "mdi:home";
  }

  const zone = zones.find((z) => state === z.attributes.friendly_name);
  if (zone && zone.attributes.icon) {
    return zone.attributes.icon;
  }

  return "mdi:home";
}

export function getStateColor(stateObj: HassEntity, zones: HassEntity[]) {
  const state = stateObj.state;
  if (state === UNKNOWN) {
    return "var(--rgb-state-person-unknown)";
  } else if (state === "not_home") {
    return "var(--rgb-state-person-not-home)";
  } else if (state === "home") {
    return "var(--rgb-state-person-home)";
  }
  const isInZone = zones.some((z) => state === z.attributes.friendly_name);
  if (isInZone) {
    return "var(--rgb-state-person-zone)";
  }
  return "var(--rgb-state-person-home)";
}
