import { HassEntity } from "home-assistant-js-websocket";
import { atLeastVersion, EntityNameItem, HomeAssistant } from "../ha";

export function computeEntityName(
  hass: HomeAssistant,
  stateObj: HassEntity,
  name: string | EntityNameItem | EntityNameItem[] | undefined
): string {
  if (atLeastVersion(hass.config.version, 2026, 4)) {
    return hass.formatEntityName!(stateObj, name);
  }
  if (typeof name === "string") {
    return name;
  }
  return stateObj.attributes.friendly_name || "";
}
